'use client';
import { useEffect, useState } from 'react';
type Member = { id: string; email: string; roles: string[]; active: boolean };
export function Members({ local }: { local: boolean }) {
  const [members, setMembers] = useState<Member[]>([]),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false);
  async function refresh() {
    const r = await fetch('/api/admin/members');
    if (r.ok) setMembers((await r.json()).members);
  }
  useEffect(() => {
    if (!local) void refresh();
  }, [local]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    setNotice('');
    try {
      const r = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grant', email: fd.get('email'), role: fd.get('role') }),
      });
      if (!r.ok)
        throw new Error(
          'Access could not be granted. Confirm the Firebase account exists and you are an owner.',
        );
      await refresh();
      form.reset();
      setNotice(
        'Staff access recorded. No invitation email was sent. The person can use their configured sign-in or recovery flow.',
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Please retry.');
    } finally {
      setBusy(false);
    }
  }
  async function revoke(id: string) {
    setBusy(true);
    try {
      const r = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', uid: id }),
      });
      if (!r.ok)
        throw new Error('Could not revoke access. You cannot revoke your own owner account.');
      await refresh();
      setNotice('Membership disabled and sessions revoked.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Please retry.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="editor-card">
      <h2>Individual accounts and clear permissions</h2>
      <p className="editor-help">
        Owner, editor, publisher and enquiry operator have separate permissions. Each person needs
        their own Firebase Authentication account. Granting access does not send an email.
      </p>
      {local ? (
        <div className="setup-state">
          Firebase is not connected. This local workspace has one development owner. Staff
          invitations and revocation will be available after the EGAILE project is configured.
        </div>
      ) : (
        <>
          <form onSubmit={submit}>
            <label className="editor-field">
              <span>Existing Firebase account email</span>
              <input name="email" type="email" required maxLength={254} />
            </label>
            <label className="editor-field">
              <span>Role</span>
              <select name="role">
                <option value="editor">Editor — drafts and images</option>
                <option value="publisher">Publisher — review and publish</option>
                <option value="operator">Enquiry operator</option>
                <option value="owner">Owner — full admin control</option>
              </select>
            </label>
            <button disabled={busy} className="editor-button filled">
              Grant staff access
            </button>
          </form>
          <div className="members-list">
            {members.map((m) => (
              <article key={m.id}>
                <p>
                  <strong>{m.email}</strong> · {m.roles.join(', ')} ·{' '}
                  {m.active ? 'Active' : 'Revoked'}
                </p>
                {m.active && (
                  <button disabled={busy} className="editor-button" onClick={() => revoke(m.id)}>
                    Revoke access
                  </button>
                )}
              </article>
            ))}
          </div>
        </>
      )}
      {notice && (
        <p role="status" className="editor-help">
          {notice}
        </p>
      )}
    </div>
  );
}
