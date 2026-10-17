'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
export function Login({ local }: { local: boolean }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function exchange(idToken?: string) {
    const res = await fetch('/api/owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', ...(idToken ? { idToken } : {}) }),
    });
    if (!res.ok) throw new Error('Sign-in could not be completed. Check your EGAILE staff access.');
    router.push('/admin');
    router.refresh();
  }
  async function login() {
    setBusy(true);
    setError('');
    try {
      if (local) await exchange();
      else {
        const [{ firebaseClient }, f] = await Promise.all([
          import('@/lib/firebase-client'),
          import('firebase/auth'),
        ]);
        const auth = firebaseClient();
        await f.setPersistence(auth, f.inMemoryPersistence);
        const provider = new f.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const credential = await f.signInWithPopup(auth, provider);
        try {
          await exchange(await credential.user.getIdToken());
        } finally {
          await f.signOut(auth);
        }
      }
    } catch (e) {
      setError(
        e instanceof Error && e.message.startsWith('Firebase is not')
          ? e.message
          : 'Google sign-in could not be completed. Only approved EGAILE staff can enter.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-screen">
      <div className="login-panel">
        <Link href="/" className="login-brand" aria-label="EGAILE home">
          <BrandLogo variant="login" tone="ink" />
        </Link>
        <p className="eyebrow">ADMIN WORKSPACE</p>
        <h1>Make it yours.</h1>
        <p>Sign in with your approved Google account to manage the website.</p>
        {local && (
          <div className="local-notice">
            <strong>Local development workspace</strong>
            <p>
              Changes and test enquiries are saved on this computer. Cloud sign-in is not connected
              here yet. This shortcut is disabled in production.
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="button primary" disabled={busy} onClick={login}>
          {busy ? 'Signing in…' : local ? 'Open local workspace ↗' : 'Continue with Google ↗'}
        </button>
        <p>Visitors can browse the public website without an account.</p>
        <Link href="/" className="text-link">
          Back to the website
        </Link>
      </div>
    </main>
  );
}
