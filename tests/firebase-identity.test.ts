import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { firebaseAdmin } from '../src/server/firebase';
import { principalFromFirebase } from '../src/server/auth';
import { can } from '../src/lib/permissions';
const enabled = !!process.env.FIRESTORE_EMULATOR_HOST && !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

test(
  'Firebase identity requires an active membership, not merely a valid login',
  { skip: !enabled },
  async () => {
    const { auth, db } = firebaseAdmin();
    const email = `synthetic-${randomUUID()}@example.invalid`;
    const user = await auth.createUser({
      email,
      password: 'Synthetic-emulator-only-42!',
      emailVerified: true,
    });
    await assert.rejects(() => principalFromFirebase(user.uid, email), /FORBIDDEN/);
    await db
      .collection('memberships')
      .doc(user.uid)
      .set({ email, roles: ['editor'], active: true });
    const principal = await principalFromFirebase(user.uid, email);
    assert.equal(can(principal, 'content.write'), true);
    assert.equal(can(principal, 'leads.read'), false);
    assert.equal(can(principal, 'content.publish'), false);
    await db.collection('memberships').doc(user.uid).update({ active: false });
    await assert.rejects(() => principalFromFirebase(user.uid, email), /FORBIDDEN/);
  },
);

test(
  'Firebase session cookies verify identity and reject a revoked session',
  { skip: !enabled },
  async () => {
    const { auth } = firebaseAdmin();
    const email = `session-${randomUUID()}@example.invalid`,
      password = 'Synthetic-emulator-only-42!';
    const user = await auth.createUser({ email, password, emailVerified: true });
    const response = await fetch(
      `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=synthetic`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
    assert.equal(response.status, 200);
    const { idToken } = await response.json();
    const cookie = await auth.createSessionCookie(idToken, { expiresIn: 8 * 3600000 });
    assert.equal((await auth.verifySessionCookie(cookie, true)).uid, user.uid);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await auth.revokeRefreshTokens(user.uid);
    await assert.rejects(() => auth.verifySessionCookie(cookie, true));
  },
);

test('Firestore rules reject direct unauthorised browser reads', { skip: !enabled }, async () => {
  const response = await fetch(
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/enquiries`,
  );
  assert.equal(response.status, 403);
});
