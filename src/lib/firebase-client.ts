import { getApps, initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
export function firebaseClient() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId)
    throw new Error(
      'Firebase is not connected yet. Configure the EGAILE project before signing in.',
    );
  const app =
    getApps()[0] ||
    initializeApp({ apiKey, projectId, authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN });
  const auth = getAuth(app);
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_AUTH_EMULATOR === 'true' &&
    !auth.emulatorConfig
  )
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  return auth;
}
