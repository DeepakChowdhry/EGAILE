'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export function Login({ local }: { local: boolean }) {
  const [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false),
    [email, setEmail] = useState('');
  const router = useRouter();
  async function exchange(idToken?: string) {
    const res = await fetch('/api/owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', ...(idToken ? { idToken } : {}) }),
    });
    if (!res.ok)
      throw new Error(
        'Sign-in could not be completed. Check your account and EGAILE staff access.',
      );
    router.push('/admin');
    router.refresh();
  }
  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    const fd = new FormData(event.currentTarget);
    try {
      if (local) await exchange();
      else {
        const [{ firebaseClient }, f] = await Promise.all([
          import('@/lib/firebase-client'),
          import('firebase/auth'),
        ]);
        const auth = firebaseClient();
        await f.setPersistence(auth, f.inMemoryPersistence);
        const credential = await f.signInWithEmailAndPassword(
          auth,
          email,
          String(fd.get('password') || ''),
        );
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
          : 'Sign-in could not be completed. Check your details and staff access.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const [{ firebaseClient }, { sendPasswordResetEmail }] = await Promise.all([
        import('@/lib/firebase-client'),
        import('firebase/auth'),
      ]);
      await sendPasswordResetEmail(firebaseClient(), email);
    } catch {
      /* Keep recovery response generic. */
    } finally {
      setNotice('If an eligible account exists, recovery instructions will be sent.');
      setBusy(false);
    }
  }
  async function google() {
    setBusy(true);
    setError('');
    try {
      const [{ firebaseClient }, f] = await Promise.all([
        import('@/lib/firebase-client'),
        import('firebase/auth'),
      ]);
      const auth = firebaseClient();
      await f.setPersistence(auth, f.inMemoryPersistence);
      const credential = await f.signInWithPopup(auth, new f.GoogleAuthProvider());
      try {
        await exchange(await credential.user.getIdToken());
      } finally {
        await f.signOut(auth);
      }
    } catch {
      setError('Google sign-in could not be completed. Only invited staff can enter.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-screen">
      <div className="login-panel">
        <Link href="/" className="login-brand">
          EGAILE<span>.</span>
        </Link>
        <p className="eyebrow">YOUR WEBSITE WORKSPACE</p>
        <h1>Make it yours.</h1>
        <p>Update your website and keep conversations moving.</p>
        <form onSubmit={login}>
          {local ? (
            <div className="local-notice">
              <strong>Local development workspace</strong>
              <p>
                Changes and test enquiries are saved on this computer. Firebase is not connected.
                This shortcut is disabled in production.
              </p>
            </div>
          ) : (
            <>
              <label className="field">
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  maxLength={254}
                />
              </label>
              <label className="field">
                Password
                <input
                  name="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  maxLength={300}
                />
              </label>
              <label className="editor-check">
                <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
                Show password
              </label>
            </>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {notice && <p role="status">{notice}</p>}
          <button className="button primary" disabled={busy}>
            {busy ? 'Signing in…' : local ? 'Open local workspace ↗' : 'Sign in ↗'}
          </button>
        </form>
        {!local && (
          <div className="login-options">
            <button className="editor-button" disabled={busy} onClick={reset}>
              Forgot password?
            </button>
            <button className="editor-button" disabled={busy} onClick={google}>
              Continue with Google
            </button>
          </div>
        )}
        <Link href="/" className="text-link">
          Back to the website
        </Link>
      </div>
    </main>
  );
}
