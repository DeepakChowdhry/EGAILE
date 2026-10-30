import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  readContent,
  writeContent,
  history,
  restoreContent,
  lookupRedirect,
} from '../src/server/content-repository';
import {
  acceptEnquiry,
  listEnquiries,
  dispatchNotifications,
  updateEnquiry,
  deleteEnquiry,
  enquirySchema,
  retryNotification,
} from '../src/server/enquiries';
import { transaction, readStore } from '../src/server/db';
import { siteSchema, pagePath } from '../src/lib/content';
import { can, type Principal } from '../src/lib/permissions';
process.env.EGAILE_DATA_DIR = path.join(process.cwd(), '.data', 'tests-' + randomUUID());
Object.assign(process.env, { NODE_ENV: 'test' });
process.env.EGAILE_BACKEND ||= 'local';
const enquiry = {
  name: 'Synthetic visitor',
  email: 'test@example.com',
  company: 'Synthetic organisation',
  message: 'A synthetic process enquiry used to verify reliable persistence.',
  privacy: true,
  privacyVersion: 'website-preview-v1',
  sourcePath: '/contact',
  website: '',
  country: 'IN',
  service: 'process-gap-assessment',
  industry: 'it-services',
  processArea: 'software-delivery',
};

test('drafts stay private; stale concurrent writes fail; publication and content restore are independent', async () => {
  const initial = await readContent();
  assert.equal(initial.site.pages.filter((p) => p.type === 'service').length, 6);
  const draft = structuredClone(initial.site);
  draft.hero.title = 'Synthetic unpublished headline';
  const v2 = await writeContent(draft, initial.version, 'save', 'test-editor');
  assert.equal((await readContent()).site.hero.title, initial.site.hero.title);
  assert.equal((await readContent(true)).site.hero.title, draft.hero.title);
  const results = await Promise.allSettled([
    writeContent(draft, v2, 'save'),
    writeContent(draft, v2, 'save'),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.filter((r) => r.status === 'rejected').length, 1);
  await assert.rejects(() => writeContent(draft, initial.version, 'publish'), /VERSION_CONFLICT/);
  const current = await readContent(true);
  const published = await writeContent(current.site, current.version, 'publish', 'test-publisher');
  assert.equal((await readContent()).site.hero.title, draft.hero.title);
  const revisions = await history();
  await restoreContent(revisions[0].id, published);
  assert.equal((await readContent(true)).site.hero.title, initial.site.hero.title);
  assert.equal((await readContent()).site.hero.title, draft.hero.title);
  const now = await readContent(true);
  await writeContent(now.site, now.version, 'publish');
});

test('schema rejects executable destinations, draft menu targets and duplicate route identities', () => {
  const site = structuredClone(requireSeed());
  site.hero.ctaHref = 'javascript:alert(1)';
  assert.equal(siteSchema.safeParse(site).success, false);
  const s = structuredClone(requireSeed());
  s.menu.push({ label: 'Missing', href: '/missing' });
  assert.equal(siteSchema.safeParse(s).success, false);
  const duplicate = structuredClone(requireSeed());
  duplicate.pages.push({ ...duplicate.pages[0] });
  assert.equal(siteSchema.safeParse(duplicate).success, false);
});
function requireSeed() {
  return siteSchema.parse(seed);
}
import seed from '../src/lib/seed.json';

test('slug changes preserve historical redirects without loops when a slug is reused', async () => {
  let { site, version } = await readContent(true);
  const page = site.pages.find((p) => p.type === 'service')!;
  const old = pagePath(page);
  page.slug = 'renamed-assessment';
  version = await writeContent(site, version, 'publish');
  assert.equal(await lookupRedirect(old), pagePath(page));
  page.slug = 'process-gap-assessment';
  version = await writeContent(site, version, 'publish');
  assert.equal(await lookupRedirect('/services/renamed-assessment'), pagePath(page));
  assert.equal(await lookupRedirect(old), null);
});

test('concurrent retry returns one receipt and atomically stores exactly one notification task', async () => {
  const key = randomUUID();
  const results = await Promise.all(
    Array.from({ length: 8 }, () => acceptEnquiry(enquiry, key, 'retry-test')),
  );
  assert.equal(new Set(results.map((r) => r.reference)).size, 1);
  const db = await readStore();
  const leads = await db.list('enquiries', 100),
    tasks = await db.list('deliveryTasks', 100);
  assert.equal(leads.length, 1);
  assert.equal(tasks.length, 1);
  const body = leads[0].body as Record<string, string>;
  assert.equal(body.industryLabel.includes('software'), true);
  assert.ok(body.serviceId);
  await assert.rejects(
    () =>
      acceptEnquiry(
        { ...enquiry, message: 'A changed message must never reuse an earlier receipt.' },
        key,
        'retry-test',
      ),
    /IDEMPOTENCY_CONFLICT/,
  );
});

test('transaction rollback leaves no partially accepted data', async () => {
  const id = randomUUID();
  await assert.rejects(() =>
    transaction(async (db) => {
      await db.set('enquiries', id, { synthetic: true });
      await db.set('deliveryTasks', id, { state: 'pending' });
      throw Error('SIMULATED_COMMIT_FAILURE');
    }),
  );
  const db = await readStore();
  assert.equal(await db.get('enquiries', id), null);
  assert.equal(await db.get('deliveryTasks', id), null);
});

test('validation rejects sensitive uploads, unknown service identifiers and unacknowledged privacy', async () => {
  assert.equal(enquirySchema.safeParse({ ...enquiry, file: 'private-code.zip' }).success, false);
  assert.equal(enquirySchema.safeParse({ ...enquiry, privacy: false }).success, false);
  await assert.rejects(
    () => acceptEnquiry({ ...enquiry, service: 'not-a-service' }, randomUUID(), 'invalid'),
    /INVALID_BODY/,
  );
  await assert.rejects(() => acceptEnquiry(enquiry, 'bad-key', 'invalid'), /INVALID_BODY/);
});

test('rate limits do not destroy accepted requests and duplicate retry does not consume allowance', async () => {
  for (let i = 0; i < 5; i++) await acceptEnquiry(enquiry, randomUUID(), 'rate-test');
  await assert.rejects(() => acceptEnquiry(enquiry, randomUUID(), 'rate-test'), /RATE_LIMITED/);
  assert.equal((await listEnquiries()).length, 6);
});

test('roles separate editing, publication, membership and private enquiry access', () => {
  const account = (role: Principal['roles'][number]): Principal => ({
    uid: 'test',
    email: 'test@example.com',
    roles: [role],
  });
  assert.equal(can(account('editor'), 'content.write'), true);
  assert.equal(can(account('editor'), 'content.publish'), false);
  assert.equal(can(account('editor'), 'leads.read'), false);
  assert.equal(can(account('operator'), 'leads.write'), true);
  assert.equal(can(account('operator'), 'content.read'), false);
  assert.equal(can(account('operator'), 'members.manage'), false);
  assert.equal(can(account('operator'), 'leads.delete'), false);
  assert.equal(can(account('publisher'), 'content.publish'), true);
  assert.equal(can(account('publisher'), 'members.manage'), false);
  assert.equal(can(null, 'content.read'), false);
});

test('status transitions reject skipped qualification and deletion removes its task and retry mapping', async () => {
  const row = (await listEnquiries())[0];
  await assert.rejects(() => updateEnquiry(row.id, 'Qualified'), /INVALID_TRANSITION/);
  await updateEnquiry(row.id, 'Reviewed');
  assert.equal((await listEnquiries()).find((r) => r.id === row.id)?.status, 'Reviewed');
  await deleteEnquiry(row.id);
  const db = await readStore();
  assert.equal(await db.get('enquiries', row.id), null);
  assert.equal(await db.get('deliveryTasks', row.id), null);
  assert.equal((await db.find('submissionKeys', 'enquiry_id', '==', row.id, 10)).length, 0);
});

test('worker handles duplicate execution, provider errors and expired leases without losing enquiries', async () => {
  const row = (await listEnquiries())[0];
  delete process.env.RESEND_API_KEY;
  assert.equal((await dispatchNotifications(row.id)).configured, false);
  Object.assign(process.env, {
    RESEND_API_KEY: 'synthetic-key',
    NOTIFICATION_FROM: 'test@example.com',
    NOTIFICATION_TO: 'test@example.com',
  });
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 15));
    return new Response('{}', { status: 200 });
  };
  try {
    await Promise.all([dispatchNotifications(row.id), dispatchNotifications(row.id)]);
    assert.equal(calls, 2);
    assert.equal((await (await readStore()).get('deliveryTasks', row.id))?.state, 'accepted');
    const next = (await listEnquiries()).find((r) => r.id !== row.id)!;
    globalThis.fetch = async () => new Response('{}', { status: 500 });
    await dispatchNotifications(next.id);
    const db = await readStore();
    const pending = await db.get('deliveryTasks', next.id);
    assert.equal(pending?.state, 'pending');
    assert.equal(pending?.attempts, 1);
    assert.ok(await db.get('enquiries', next.id));
    await transaction(async (s) => {
      const task = await s.get('deliveryTasks', next.id);
      await s.set('deliveryTasks', next.id, {
        ...task,
        state: 'processing',
        next_attempt: '2000-01-01',
        lease_until: '2000-01-01',
        lease_token: 'expired',
      });
    });
    globalThis.fetch = async () => new Response('{}', { status: 400 });
    await dispatchNotifications(next.id);
    assert.equal((await db.get('deliveryTasks', next.id))?.state, 'failed');
    assert.ok(await db.get('enquiries', next.id));
    await retryNotification(next.id, 'test-operator');
    assert.equal((await db.get('deliveryTasks', next.id))?.state, 'pending');
  } finally {
    globalThis.fetch = original;
    delete process.env.RESEND_API_KEY;
  }
});

test('production cannot silently fall back to the local database', async () => {
  const environment = process.env.NODE_ENV,
    mode = process.env.EGAILE_BACKEND;
  try {
    Object.assign(process.env, { NODE_ENV: 'production', EGAILE_BACKEND: 'local' });
    await assert.rejects(() => readContent(), /FIREBASE_CONFIGURATION_REQUIRED/);
  } finally {
    Object.assign(process.env, { NODE_ENV: environment, EGAILE_BACKEND: mode });
  }
});

test('expanded enquiry options are accepted, labelled and stored; unknown options are rejected', async () => {
  const input = {
    ...enquiry,
    service: 'team-training',
    industry: 'healthcare',
    processArea: 'finance',
  };
  const receipt = await acceptEnquiry(input, randomUUID(), 'expanded-options-visitor');
  const saved = (await listEnquiries()).find((row) => row.reference === receipt.reference);
  assert.ok(saved);
  assert.equal(saved.body.serviceLabel, 'Team training and technology adoption');
  assert.equal(saved.body.industryLabel, 'Healthcare and clinics');
  assert.equal(saved.body.country, 'IN');
  assert.equal(
    enquirySchema.safeParse({ ...input, processArea: 'unknown-process' }).success,
    false,
  );
  await assert.rejects(
    () =>
      acceptEnquiry({ ...input, industry: 'unknown-industry' }, randomUUID(), 'invalid-options'),
    /INVALID_BODY/,
  );
});

test('requester confirmation contains the enquiry and retries independently of support notification', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.NOTIFICATION_FROM;
  const originalTo = process.env.NOTIFICATION_TO;
  process.env.RESEND_API_KEY = 'synthetic-key';
  delete process.env.NOTIFICATION_FROM;
  delete process.env.NOTIFICATION_TO;
  const receipt = await acceptEnquiry(enquiry, randomUUID(), 'confirmation-test');
  const row = (await listEnquiries()).find((lead) => lead.reference === receipt.reference)!;
  const messages: {
    to: string[];
    from: string;
    reply_to: string;
    text: string;
    subject: string;
  }[] = [];
  try {
    globalThis.fetch = async (_url, init) => {
      messages.push(JSON.parse(String(init?.body)));
      return new Response('{}', { status: messages.length === 2 ? 503 : 200 });
    };
    await dispatchNotifications(row.id);
    assert.equal(messages.length, 2);
    assert.deepEqual(messages[0].to, ['Support@egaile.com']);
    assert.deepEqual(messages[1].to, [enquiry.email]);
    assert.equal(messages[1].from, 'EGAILE Support Team <Support@egaile.com>');
    assert.equal(messages[1].reply_to, 'Support@egaile.com');
    assert.ok(messages[1].text.includes(enquiry.message));
    assert.ok(messages[1].subject.includes(receipt.reference));
    await transaction(async (db) => {
      const task = await db.get('deliveryTasks', row.id);
      assert.ok(task?.support_accepted_at);
      assert.equal(task?.requester_accepted_at, undefined);
      await db.set('deliveryTasks', row.id, { ...task, next_attempt: '2000-01-01' });
    });
    await dispatchNotifications(row.id);
    assert.equal(messages.length, 3);
    assert.deepEqual(messages[2].to, [enquiry.email]);
    assert.equal((await (await readStore()).get('deliveryTasks', row.id))?.state, 'accepted');
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries({
      RESEND_API_KEY: originalKey,
      NOTIFICATION_FROM: originalFrom,
      NOTIFICATION_TO: originalTo,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
