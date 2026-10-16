import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
export function firebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('FIREBASE_CONFIGURATION_REQUIRED');
  if (
    process.env.NODE_ENV === 'production' &&
    (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST)
  )
    throw new Error('EMULATOR_FORBIDDEN_IN_PRODUCTION');
  const app =
    getApps().find((a) => a.name === 'egaile') ||
    initializeApp(
      {
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        ...(!process.env.FIRESTORE_EMULATOR_HOST ? { credential: applicationDefault() } : {}),
      },
      'egaile',
    );
  return { app, db: getFirestore(app), auth: getAuth(app), bucket: () => getStorage(app).bucket() };
}
