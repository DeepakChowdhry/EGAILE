import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { createFederatedAuth, federationConfig } from '../src/server/vercel-federation';
import { firebaseAdmin } from '../src/server/firebase';

const env = {
  FIREBASE_PROJECT_ID: 'demo-egaile',
  GCP_PROJECT_ID: 'demo-egaile',
  GCP_PROJECT_NUMBER: '123456789012',
  GCP_SERVICE_ACCOUNT_EMAIL: 'runtime@demo-egaile.iam.gserviceaccount.com',
  GCP_WORKLOAD_IDENTITY_POOL_ID: 'egaile-vercel',
  GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: 'egaile-vercel',
};

test('Vercel federation rejects missing, mismatched and malformed settings', () => {
  for (const key of Object.keys(env)) {
    assert.throws(() => federationConfig({ ...env, [key]: '' }), /CONFIGURATION_REQUIRED/);
  }
  for (const override of [
    { GCP_PROJECT_ID: 'other-project' },
    { GCP_PROJECT_NUMBER: '../123456789' },
    { GCP_SERVICE_ACCOUNT_EMAIL: 'runtime@other-project.iam.gserviceaccount.com' },
    { GCP_WORKLOAD_IDENTITY_POOL_ID: '../pool' },
    { GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: 'provider?redirect=evil' },
  ])
    assert.throws(() => federationConfig({ ...env, ...override }), /CONFIGURATION_REQUIRED/);
});

test('Google SDK exchanges a request token, impersonates the service account, caches and refreshes', async (t) => {
  let supplied = 0;
  const { client, credential } = createFederatedAuth(
    env,
    async () => `synthetic-oidc-${++supplied}`,
  );
  assert.equal(supplied, 0, 'construction must not require a request context');
  const requests: string[] = [];
  t.mock.method(
    Object.getPrototypeOf(client.transporter),
    'request',
    async (options: { url: string; data: URLSearchParams; headers: Headers }) => {
      requests.push(String(options.url));
      if (String(options.url) === 'https://sts.googleapis.com/v1/token') {
        assert.equal(options.data.get('subject_token'), `synthetic-oidc-${supplied}`);
        assert.equal(options.data.get('audience'), federationConfig(env).audience);
        return { data: { access_token: 'synthetic-sts', expires_in: 3600, token_type: 'Bearer' } };
      }
      assert.equal(String(options.url), federationConfig(env).service_account_impersonation_url);
      assert.equal(new Headers(options.headers).get('authorization'), 'Bearer synthetic-sts');
      return {
        data: {
          accessToken: `synthetic-access-${supplied}`,
          expireTime: new Date(Date.now() + 3600000).toISOString(),
        },
      };
    },
  );
  const first = await credential.getAccessToken();
  assert.equal(first.access_token, 'synthetic-access-1');
  assert.ok(first.expires_in >= 3599);
  assert.equal((await credential.getAccessToken()).access_token, first.access_token);
  assert.equal(requests.length, 2, 'Google access token reused until refresh is needed');
  const now = Date.now();
  t.mock.timers.enable({ apis: ['Date'], now: now + 3600001 });
  assert.equal((await credential.getAccessToken()).access_token, 'synthetic-access-2');
  assert.equal(requests.length, 4);
  assert.equal(supplied, 2, 'refresh retrieves a fresh request token');
});

test('Firestore and Storage accept the same external auth client without ADC', async () => {
  const { client } = createFederatedAuth(env, async () => {
    throw new Error('NO_REQUEST_TOKEN');
  });
  const db = new Firestore({ projectId: env.GCP_PROJECT_ID, authClient: client });
  const storage = new Storage({ projectId: env.GCP_PROJECT_ID, authClient: client });
  assert.equal(db.collection('published').doc('site').path, 'published/site');
  assert.equal(await storage.authClient.getClient(), client);
  await assert.rejects(() => client.getAccessToken(), /NO_REQUEST_TOKEN/);
  await db.terminate();
});

test('token exchange failures propagate without an ADC fallback', async (t) => {
  const { client, credential } = createFederatedAuth(env, async () => 'synthetic-oidc');
  t.mock.method(Object.getPrototypeOf(client.transporter), 'request', async () => {
    throw new Error('STS_DENIED');
  });
  await assert.rejects(() => credential.getAccessToken(), /STS_DENIED/);
});

test('Vercel backend fails closed without federation settings and refuses emulator routing', () => {
  const saved = { ...process.env };
  try {
    process.env.VERCEL = '1';
    process.env.FIREBASE_PROJECT_ID = 'demo-egaile';
    delete process.env.GCP_PROJECT_NUMBER;
    delete process.env.FIRESTORE_EMULATOR_HOST;
    delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    assert.throws(() => firebaseAdmin(), /VERCEL_FEDERATION_CONFIGURATION_REQUIRED/);
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    assert.throws(() => firebaseAdmin(), /EMULATOR_FORBIDDEN_IN_PRODUCTION/);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
});
