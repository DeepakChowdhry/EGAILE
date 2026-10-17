import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { createFederatedAuth } from './vercel-federation';

let vercelServices: ReturnType<typeof createVercelServices> | undefined;
function createVercelServices(projectId: string) {
  const { client, credential } = createFederatedAuth();
  const app =
    getApps().find((a) => a.name === 'egaile-vercel') ||
    initializeApp({ projectId, credential }, 'egaile-vercel');
  // Admin SDK database/storage factories accept ADC or certificate credentials only.
  // The underlying Google clients support an external-account authClient directly.
  const db = new Firestore({ projectId, authClient: client });
  const storage = new Storage({ projectId, authClient: client });
  return {
    app,
    db,
    auth: getAuth(app),
    bucket: () => {
      const name = process.env.FIREBASE_STORAGE_BUCKET;
      if (!name) throw new Error('FIREBASE_STORAGE_CONFIGURATION_REQUIRED');
      return storage.bucket(name);
    },
  };
}
export function firebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('FIREBASE_CONFIGURATION_REQUIRED');
  if (
    process.env.NODE_ENV === 'production' &&
    (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST)
  )
    throw new Error('EMULATOR_FORBIDDEN_IN_PRODUCTION');
  if (process.env.VERCEL === '1') {
    if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST)
      throw new Error('EMULATOR_FORBIDDEN_IN_PRODUCTION');
    return (vercelServices ??= createVercelServices(projectId));
  }
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
