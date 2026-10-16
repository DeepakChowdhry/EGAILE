import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readTrafficChoice, trafficAllowed, publicTrafficPath } from '../src/lib/traffic-policy';
test('traffic measurement requires production and the exact public domain', () => {
  assert.equal(trafficAllowed('www.egaile.com', true, true), true);
  for (const host of [
    'localhost',
    '127.0.0.1',
    'staging.egaile.com',
    'egaile.com.attacker.example',
  ])
    assert.equal(trafficAllowed(host, true, true), false);
  assert.equal(trafficAllowed('egaile.com', false, true), false);
  assert.equal(trafficAllowed('egaile.com', true, false), false);
});
test('analytics cannot accept private or unapproved page paths', () => {
  const paths = ['/', '/services/process-gap-assessment', '/admin', '/preview', '/api/owner'];
  assert.equal(publicTrafficPath('/', paths), true);
  assert.equal(publicTrafficPath('/services/process-gap-assessment', paths), true);
  for (const path of [
    '/admin',
    '/admin/login',
    '/preview',
    '/api/owner',
    '/unknown',
    '/?email=private',
  ])
    assert.equal(publicTrafficPath(path, paths), false);
});
test('consent expires and malformed or future preferences do not opt visitors in', () => {
  const now = Date.now();
  assert.equal(
    readTrafficChoice(JSON.stringify({ choice: 'accepted', time: now }), now),
    'accepted',
  );
  assert.equal(
    readTrafficChoice(JSON.stringify({ choice: 'declined', time: now }), now),
    'declined',
  );
  for (const value of [
    null,
    '{}',
    'bad-json',
    JSON.stringify({ choice: 'accepted', time: now + 1 }),
    JSON.stringify({ choice: 'accepted', time: now - 181 * 86400000 }),
  ])
    assert.equal(readTrafficChoice(value, now), null);
});
