import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const mutate = process.argv.includes('--isolated');
const origin = process.env.QA_ORIGIN || `http://127.0.0.1:${mutate ? '3011' : '3010'}`;
if (mutate && origin !== 'http://127.0.0.1:3011')
  throw Error('Writes are restricted to the disposable QA server on port 3011.');
const rows = [];
let cookie = '';
const call = (p, { method = 'GET', body, auth = false, headers = {} } = {}) =>
  fetch(origin + p, {
    method,
    redirect: 'manual',
    headers: {
      ...(body ? { 'Content-Type': 'application/json', Origin: origin } : {}),
      ...(auth ? { Cookie: cookie } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
async function check(id, name, fn) {
  try {
    const evidence = await fn();
    rows.push({ id, name, status: 'PASS', evidence: evidence || '' });
  } catch (e) {
    rows.push({ id, name, status: 'FAIL', evidence: e.message });
  }
  console.log(
    `${rows.at(-1).status} ${id} ${name}${rows.at(-1).status === 'FAIL' ? ': ' + rows.at(-1).evidence : ''}`,
  );
}
const health = await (await call('/api/health')).json();
if (mutate && health.edition !== 'local')
  throw Error('Refusing to mutate a cloud-connected server.');
const pages = new Set([
  '/',
  '/services',
  '/industries',
  '/approach',
  '/about',
  '/contact',
  '/privacy',
  '/cookies',
  '/insights',
  '/solutions',
]);
const assets = new Set(['/icon.png', '/brand/egaile-mark.png']);
for (const p of pages) {
  if (pages.size > 100) throw Error('Crawl limit exceeded');
  await check(
    `PAGE-${rows.filter((r) => r.id.startsWith('PAGE-')).length + 1}`,
    `Public route ${p}`,
    async () => {
      const r = await call(p);
      if ([307, 308].includes(r.status)) {
        const target = r.headers.get('location');
        assert.ok(target?.startsWith('/'));
        pages.add(target);
        return `${r.status} → ${target}`;
      }
      assert.equal(r.status, 200);
      const html = await r.text();
      assert.match(html, /<main[\s>]/);
      assert.match(html, /<h1[\s>]/);
      for (const [, href] of html.matchAll(/href="([^"#?]+)(?:[?#][^"]*)?"/g)) {
        if (
          href.startsWith('/') &&
          !href.startsWith('//') &&
          !/^\/(?:_next|admin|preview|api)\b/.test(href)
        ) {
          if (/\.(?:png|jpg|webp|ico|svg)$/.test(href)) assets.add(href);
          else pages.add(href);
        }
      }
      for (const [, src] of html.matchAll(/<img[^>]+src="([^"]+)"/g))
        if (src.startsWith('/')) assets.add(src);
      return '200; main landmark and heading present';
    },
  );
}
await check('ASSETS', 'All discovered local image assets load', async () => {
  for (const p of assets) {
    const r = await call(p);
    assert.equal(r.status, 200, p);
    assert.match(r.headers.get('content-type') || '', /^image\//, p);
  }
  return `${assets.size} assets`;
});
await check('404', 'Unknown page returns 404', async () =>
  assert.equal((await call('/qa-missing-page')).status, 404),
);
await check('SEO', 'Sitemap and prelaunch robots policy', async () => {
  assert.equal((await call('/sitemap.xml')).status, 200);
  assert.match(await (await call('/robots.txt')).text(), /Disallow: \//);
});
await check('HEADERS', 'Security headers and private framing policy', async () => {
  const r = await call('/');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('x-frame-options'), 'DENY');
  assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/);
});
for (const p of [
  '/api/admin/content',
  '/api/admin/enquiries',
  '/api/admin/media',
  '/api/admin/members',
])
  await check('AUTH-' + p.split('/').at(-1), `Anonymous access denied: ${p}`, async () =>
    assert.equal((await call(p)).status, 401),
  );
for (const p of ['/admin', '/preview', '/preview?frame=1'])
  await check('PRIVATE-' + p, `Private page redirects to login: ${p}`, async () => {
    const r = await call(p);
    assert.equal(r.status, 307);
    assert.equal(r.headers.get('location'), '/admin/login');
  });
await check('CSRF', 'Cross-origin sign-in is rejected', async () =>
  assert.equal(
    (
      await call('/api/owner', {
        method: 'POST',
        body: { action: 'login' },
        headers: { Origin: 'https://untrusted.example' },
      })
    ).status,
    403,
  ),
);
await check('DISPATCH', 'Notification worker rejects anonymous access', async () =>
  assert.equal((await call('/api/dispatch', { method: 'POST' })).status, 401),
);
await check('TITLES', 'Public detail pages do not duplicate the brand suffix', async () => {
  for (const p of [
    '/about',
    '/approach',
    '/services/process-gap-assessment',
    '/industries/it-services',
  ]) {
    const text = await (await call(p)).text();
    const title = text.match(/<title>([^<]*)<\/title>/)?.[1] || '';
    assert.ok(title.includes('EGAILE'), p);
    assert.doesNotMatch(title, /\| EGAILE\s*\| EGAILE/, p);
  }
});
await check('CONTACT-STORAGE', 'Contact page describes the actual storage backend', async () => {
  const html = await (await call('/contact')).text();
  assert.equal(
    html.includes('submissions are stored on this computer'),
    health.edition === 'local',
  );
});
if (!mutate)
  await check('GOOGLE-ONLY', 'Cloud sign-in cannot use local owner shortcut', async () =>
    assert.equal(
      (await call('/api/owner', { method: 'POST', body: { action: 'login' } })).status,
      401,
    ),
  );
if (mutate) {
  const login = await call('/api/owner', { method: 'POST', body: { action: 'login' } });
  assert.equal(login.status, 200);
  cookie = login.headers.get('set-cookie').split(';')[0];
  await check('SESSION', 'Local QA owner receives HttpOnly SameSite cookie', async () => {
    assert.match(login.headers.get('set-cookie'), /httponly/i);
    assert.match(login.headers.get('set-cookie'), /samesite=strict/i);
  });
  const baseline = await (await call('/api/admin/content', { auth: true })).json();
  let version = baseline.version;
  const draft = structuredClone(baseline.site);
  draft.hero.title = 'QA synthetic draft — not real content';
  await check('DRAFT', 'Save draft, keep public unchanged and render private preview', async () => {
    const r = await call('/api/admin/content', {
      method: 'POST',
      auth: true,
      body: { action: 'save', site: draft, version },
    });
    assert.equal(r.status, 200);
    version = (await r.json()).version;
    assert.ok(!(await (await call('/')).text()).includes(draft.hero.title));
    assert.ok(
      (await (await call('/preview?frame=1', { auth: true })).text()).includes(draft.hero.title),
    );
  });
  await check('STALE', 'Stale edits are rejected without overwriting', async () =>
    assert.equal(
      (
        await call('/api/admin/content', {
          method: 'POST',
          auth: true,
          body: { action: 'save', site: draft, version: baseline.version },
        })
      ).status,
      409,
    ),
  );
  await check('PREVIEW-HEADERS', 'Private preview allows same-origin frame only', async () => {
    const r = await call('/preview?frame=1', { auth: true });
    assert.equal(r.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'self'/);
  });
  await check('PUBLISH', 'Publish and verify public content version', async () => {
    const r = await call('/api/admin/content', {
      method: 'POST',
      auth: true,
      body: { action: 'publish', site: draft, version },
    });
    assert.equal(r.status, 200);
    version = (await r.json()).version;
    assert.equal((await (await call('/api/content-version')).json()).version, version);
    assert.ok((await (await call('/')).text()).includes(draft.hero.title));
  });
  await check('RESTORE', 'Recovery restores draft without changing public content', async () => {
    const history = (await (await call('/api/admin/content', { auth: true })).json()).history;
    const r = await call('/api/admin/content', {
      method: 'POST',
      auth: true,
      body: { action: 'restore', id: history[0].id, version },
    });
    assert.equal(r.status, 200);
    version = (await r.json()).version;
    assert.equal(
      (await (await call('/api/admin/content', { auth: true })).json()).site.hero.title,
      baseline.site.hero.title,
    );
    assert.ok((await (await call('/')).text()).includes(draft.hero.title));
  });
  const reset = await call('/api/admin/content', {
    method: 'POST',
    auth: true,
    body: { action: 'publish', site: baseline.site, version },
  });
  assert.equal(reset.status, 200);
  await check('UPLOAD-INVALID', 'Reject a disguised non-image upload', async () => {
    const f = new FormData();
    f.set('file', new Blob(['This is not an actual PNG image.']), 'bad.png');
    assert.equal(
      (
        await fetch(origin + '/api/admin/upload', {
          method: 'POST',
          headers: { Origin: origin, Cookie: cookie },
          body: f,
        })
      ).status,
      422,
    );
  });
  await check('UPLOAD', 'Optimise image, persist media record and serve it', async () => {
    const f = new FormData();
    f.set(
      'file',
      new Blob([
        await sharp({ create: { width: 16, height: 16, channels: 3, background: '#123456' } })
          .png()
          .toBuffer(),
      ]),
      'qa.png',
    );
    const r = await fetch(origin + '/api/admin/upload', {
      method: 'POST',
      headers: { Origin: origin, Cookie: cookie },
      body: f,
    });
    assert.equal(r.status, 200);
    const { url } = await r.json();
    const asset = await call(url);
    assert.equal(asset.status, 200);
    assert.equal(asset.headers.get('content-type'), 'image/webp');
    assert.ok(
      (await (await call('/api/admin/media', { auth: true })).json()).media.some(
        (m) => m.url === url,
      ),
    );
  });
  await check('VALIDATION', 'Missing enquiry fields produce field errors', async () =>
    assert.equal(
      (
        await call('/api/enquiries', {
          method: 'POST',
          body: { name: 'x' },
          headers: { 'Idempotency-Key': randomUUID() },
        })
      ).status,
      422,
    ),
  );
  const body = {
    name: 'QA synthetic visitor',
    email: 'qa@example.invalid',
    company: 'QA disposable organisation',
    message: 'Synthetic end-to-end test of the enquiry lifecycle; no customer data.',
    country: 'IN',
    service: 'process-gap-assessment',
    industry: 'it-services',
    processArea: 'operations',
    privacy: true,
    privacyVersion: 'website-preview-v1',
    sourcePath: '/contact',
    website: '',
  };
  let lead;
  await check(
    'ENQUIRY',
    'Concurrent enquiry retries produce one receipt and one lead',
    async () => {
      const key = randomUUID();
      const replies = await Promise.all(
        [1, 2].map(() =>
          call('/api/enquiries', { method: 'POST', body, headers: { 'Idempotency-Key': key } }),
        ),
      );
      for (const r of replies) assert.equal(r.status, 202);
      const receipts = await Promise.all(replies.map((r) => r.json()));
      assert.equal(receipts[0].reference, receipts[1].reference);
      const list = (
        await (await call('/api/admin/enquiries', { auth: true })).json()
      ).enquiries.filter((e) => e.reference === receipts[0].reference);
      assert.equal(list.length, 1);
      lead = list[0];
    },
  );
  if (lead) {
    await check('LEAD-STATUS', 'Reject skipped status, then persist Reviewed', async () => {
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
        (await (await call('/api/admin/enquiries', { auth: true })).json()).enquiries.find(
          (e) => e.id === lead.id,
        ).status,
        'Reviewed',
      );
    });
    await check('NO-EMAIL', 'Unconfigured email delivery does not lose enquiry', async () => {
      const r = await call('/api/admin/enquiries', {
        method: 'POST',
        auth: true,
        body: { action: 'dispatch' },
      });
      assert.equal(r.status, 200);
      assert.equal((await r.json()).configured, false);
      assert.ok(
        (await (await call('/api/admin/enquiries', { auth: true })).json()).enquiries.some(
          (e) => e.id === lead.id,
        ),
      );
    });
    await check('DELETE-TEST', 'Delete only the synthetic lead in disposable database', async () =>
      assert.equal(
        (
          await call('/api/admin/enquiries', {
            method: 'POST',
            auth: true,
            body: { action: 'delete', id: lead.id },
          })
        ).status,
        200,
      ),
    );
  }
  await check('SIGNOUT', 'Sign out invalidates admin session', async () => {
    assert.equal(
      (await call('/api/owner', { method: 'POST', auth: true, body: { action: 'logout' } })).status,
      200,
    );
    assert.equal((await call('/api/admin/content', { auth: true })).status, 401);
  });
}
await mkdir('test-results', { recursive: true });
await writeFile(
  `test-results/http-${mutate ? 'isolated' : 'connected'}.json`,
  JSON.stringify({ origin, date: new Date().toISOString(), results: rows }, null, 2),
);
console.log(
  JSON.stringify({
    pass: rows.filter((r) => r.status === 'PASS').length,
    fail: rows.filter((r) => r.status === 'FAIL').length,
  }),
);
process.exitCode = rows.some((r) => r.status === 'FAIL') ? 1 : 0;
