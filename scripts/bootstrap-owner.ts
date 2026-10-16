import { firebaseAdmin } from '../src/server/firebase';
async function main() {
  const email = process.argv[2];
  if (!email || !process.env.FIREBASE_PROJECT_ID)
    throw new Error(
      'Usage: set FIREBASE_PROJECT_ID and ADC, then npm run owner:bootstrap -- owner@example.com',
    );
  const { auth, db } = firebaseAdmin();
  const user = await auth.getUserByEmail(email);
  // Initial bootstrap cannot replace an existing owner; later changes go through the protected admin workflow.
  await db.runTransaction(async (tx) => {
    const existing = await tx.get(
      db
        .collection('memberships')
        .where('roles', 'array-contains', 'owner')
        .where('active', '==', true)
        .limit(1),
    );
    if (!existing.empty)
      throw new Error('An owner exists. Use the admin workspace to grant further access.');
    tx.set(db.collection('memberships').doc(user.uid), {
      email: user.email,
      roles: ['owner'],
      active: true,
      created_at: new Date().toISOString(),
    });
  });
  console.log('Initial owner membership recorded. No credentials were printed or email sent.');
}
main().catch(() => {
  console.error(
    'Owner bootstrap failed. Verify the EGAILE project, authorised credentials and existing Firebase account.',
  );
  process.exitCode = 1;
});
