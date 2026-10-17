import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('serverless CommonJS loads Firebase and validates JWKS without require(ESM)', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--no-experimental-require-module',
      '-e',
      `
    const assert = require('node:assert/strict');
    const crypto = require('node:crypto');
    require('firebase-admin/auth');
    require('firebase-admin/app-check');
    require('firebase-admin/firestore');
    require('firebase-admin/storage');
    require('@vercel/oidc');
    require('google-auth-library');
    const jwks = require('jwks-rsa');
    (async () => {
      for (const [type, options, alg, digest] of [
        ['rsa', {modulusLength: 2048}, 'RS256', 'sha256'],
        ['ec', {namedCurve: 'P-256'}, 'ES256', 'sha256'],
      ]) {
        const {publicKey, privateKey} = crypto.generateKeyPairSync(type, options);
        const jwk = {...publicKey.export({format: 'jwk'}), kid: 'synthetic-' + type, use: 'sig', alg};
        const client = jwks({cache: false, fetcher: async () => ({keys: [jwk]})});
        const key = await client.getSigningKey(jwk.kid);
        const message = Buffer.from('synthetic-runtime-regression');
        const signature = crypto.sign(digest, message, privateKey);
        assert.equal(crypto.verify(digest, message, key.getPublicKey(), signature), true);
        assert.equal(crypto.verify(digest, Buffer.from('tampered'), key.getPublicKey(), signature), false);
        await assert.rejects(() => client.getSigningKey('unknown-key'));
      }
      console.log('Serverless module loading and RSA/EC signing-key checks passed');
    })().catch(error => {console.error(error); process.exitCode = 1;});
  `,
    ],
    { encoding: 'utf8', timeout: 30000 },
  );
  assert.equal(result.status, 0, result.stderr || String(result.error));
  assert.match(result.stdout, /signing-key checks passed/);
});
