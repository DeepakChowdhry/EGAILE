import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
const origin = 'http://127.0.0.1:3010';
let cookie = '';
async function call(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  return fetch(origin + path, {
    method,
    redirect: 'manual',
    headers: {
      ...(body ? { 'Content-Type': 'application/json', Origin: origin } : {}),
      ...(auth ? { Cookie: cookie } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
for (const path of [
  '/',
  '/services',
  '/services/software-delivery-productivity',
  '/industries',
  '/industries/it-services',
  '/approach',
  '/about',
  '/contact',
  '/privacy',
])
  assert.equal((await call(path)).status, 200, path);
assert.equal((await call('/not-a-real-page')).status, 404);
assert.equal((await call('/api/admin/content')).status, 401);
assert.equal((await call('/api/admin/enquiries')).status, 401);
assert.equal((await call('/preview')).status, 307);
assert.equal(
  (
    await call('/api/owner', {
      method: 'POST',
      body: { action: 'login' },
      headers: { Origin: 'https://untrusted.example' },
    })
  ).status,
  403,
);
const login = await call('/api/owner', { method: 'POST', body: { action: 'login' } });
assert.equal(login.status, 200);
cookie = login.headers.get('set-cookie').split(';')[0];
const response = await call('/api/admin/content', { auth: true });
assert.equal(response.status, 200);
const baseline = await response.json();
const draft = structuredClone(baseline.site);
draft.hero.title = 'Synthetic HTTP draft check';
const save = await call('/api/admin/content', {
  method: 'POST',
  auth: true,
  body: { action: 'save', site: draft, version: baseline.version },
});
assert.equal(save.status, 200);
const saved = await save.json();
assert.equal(
  (
    await call('/api/admin/content', {
      method: 'POST',
      auth: true,
      body: { action: 'save', site: draft, version: baseline.version },
    })
  ).status,
  409,
);
assert.equal((await (await call('/')).text()).includes('Synthetic HTTP draft check'), false);
assert.equal(
  (await (await call('/preview?frame=1', { auth: true })).text()).includes(
    'Synthetic HTTP draft check',
  ),
  true,
);
const restore = await call('/api/admin/content', {
  method: 'POST',
  auth: true,
  body: { action: 'save', site: baseline.site, version: saved.version },
});
assert.equal(restore.status, 200);
const invalidUpload = new FormData();
invalidUpload.set('file', new Blob(['Not an image at all']), 'invalid.png');
assert.equal(
  (
    await fetch(origin + '/api/admin/upload', {
      method: 'POST',
      headers: { Origin: origin, Cookie: cookie },
      body: invalidUpload,
    })
  ).status,
  422,
);
const validUpload = new FormData();
validUpload.set(
  'file',
  new Blob([
    await sharp({ create: { width: 10, height: 10, channels: 3, background: '#10224b' } })
      .png()
      .toBuffer(),
  ]),
  'synthetic.png',
);
const uploaded = await fetch(origin + '/api/admin/upload', {
  method: 'POST',
  headers: { Origin: origin, Cookie: cookie },
  body: validUpload,
});
assert.equal(uploaded.status, 200);
const media = await uploaded.json();
const image = await call(media.url);
assert.equal(image.status, 200);
assert.equal(image.headers.get('content-type'), 'image/webp');
const invalid = await call('/api/enquiries', {
  method: 'POST',
  body: { name: 'x' },
  headers: { 'Idempotency-Key': randomUUID() },
});
assert.equal(invalid.status, 422);
const enquiry = {
  name: 'Synthetic local check',
  email: 'synthetic@example.com',
  company: 'EGAILE test organisation',
  message: 'Synthetic request used to verify the local contact and private enquiry workflow.',
  country: 'IN',
  service: 'software-delivery-productivity',
  industry: 'it-services',
  processArea: 'software-delivery',
  privacy: true,
  privacyVersion: 'website-preview-v1',
  sourcePath: '/contact',
  website: '',
};
const key = randomUUID();
const replies = await Promise.all([
  call('/api/enquiries', { method: 'POST', body: enquiry, headers: { 'Idempotency-Key': key } }),
  call('/api/enquiries', { method: 'POST', body: enquiry, headers: { 'Idempotency-Key': key } }),
]);
assert.equal(replies[0].status, 202);
assert.equal(replies[1].status, 202);
const receipts = await Promise.all(replies.map((r) => r.json()));
assert.equal(receipts[0].reference, receipts[1].reference);
const list = await (await call('/api/admin/enquiries', { auth: true })).json();
const lead = list.enquiries.find((e) => e.reference === receipts[0].reference);
assert.ok(lead);
assert.equal(lead.notification, 'pending');
assert.equal(
  (
    await call('/api/admin/enquiries', {
      method: 'POST',
      auth: true,
      body: { action: 'status', id: lead.id, status: 'Qualified' },
    })
  ).status,
  422,
);
assert.equal(
  (
    await call('/api/admin/enquiries', {
      method: 'POST',
      auth: true,
      body: { action: 'status', id: lead.id, status: 'Reviewed' },
    })
  ).status,
  200,
);
assert.equal(
  (await call('/api/admin/enquiries', { method: 'POST', auth: true, body: { action: 'dispatch' } }))
    .status,
  200,
);
assert.equal(
  (await call('/api/owner', { method: 'POST', auth: true, body: { action: 'logout' } })).status,
  200,
);
assert.equal((await call('/api/admin/content', { auth: true })).status, 401);
console.log(
  'HTTP checks passed: public routes, denied access, CSRF, private drafts, stale edits, upload rejection, enquiry deduplication, status rules and sign-out.',
);
console.log('One clearly labelled synthetic enquiry remains for local dashboard review.');
