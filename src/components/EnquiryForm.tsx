'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import type { ContentPage } from '@/lib/content';
export function EnquiryForm({
  services,
  industries,
  selected = '',
  local,
}: {
  services: ContentPage[];
  industries: ContentPage[];
  selected?: string;
  local: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [fields, setFields] = useState<Record<string, string>>({}),
    [reference, setReference] = useState('');
  const summary = useRef<HTMLDivElement>(null);
  const attempt = useRef({ payload: '', key: '' });
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setFields({});
    const fd = new FormData(event.currentTarget);
    const body = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      company: String(fd.get('company') || ''),
      message: String(fd.get('message') || ''),
      service: String(fd.get('service') || ''),
      country: String(fd.get('country') || ''),
      industry: String(fd.get('industry') || ''),
      processArea: String(fd.get('processArea') || ''),
      privacy: fd.get('privacy') === 'on',
      privacyVersion: 'website-preview-v1',
      sourcePath: '/contact',
      website: String(fd.get('website') || ''),
    };
    const payload = JSON.stringify(body);
    if (attempt.current.payload !== payload)
      attempt.current = { payload, key: crypto.randomUUID() };
    try {
      const { appCheckHeaders } = await import('@/lib/app-check');
      const protection = await appCheckHeaders();
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': attempt.current.key,
          ...protection,
        },
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) {
        setFields(data.fields || {});
        throw new Error(
          res.status === 429
            ? 'Please wait a little before trying again. Your information remains in this form.'
            : res.status === 422
              ? 'Please check the highlighted fields.'
              : 'We couldn’t confirm receipt. Your information remains here—please retry.',
        );
      }
      setReference(data.reference);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please retry.');
      requestAnimationFrame(() => summary.current?.focus());
    } finally {
      setBusy(false);
    }
  }
  if (reference)
    return (
      <div className="receipt-panel" role="status">
        <span className="receipt-icon" aria-hidden="true">
          ✓
        </span>
        <p className="eyebrow">ENQUIRY RECEIVED</p>
        <h2>
          Thank you for
          <br />
          starting the conversation.
        </h2>
        <p>
          Your reference is <strong>{reference}</strong>.
        </p>
        <p>
          {local
            ? 'Your request is saved in this local application. You can find it in the owner dashboard; external email delivery is not configured.'
            : 'Your request has been saved for the EGAILE team to review.'}
        </p>
        <Link className="text-link" href="/">
          Explore EGAILE ↗
        </Link>
      </div>
    );
  return (
    <form onSubmit={submit} className="enquiry-form">
      <div
        ref={summary}
        tabIndex={-1}
        role={error ? 'alert' : undefined}
        className={error ? 'form-error' : ''}
      >
        {error}
      </div>
      <div className="form-grid">
        {[
          ['name', 'Your name', 'text', 100],
          ['email', 'Email address', 'email', 254],
          ['company', 'Company or organisation', 'text', 150],
        ].map(([name, label, type, max]) => (
          <label className={name === 'company' ? 'field full' : 'field'} key={name}>
            <span>
              {label} <small>Required</small>
            </span>
            <input
              name={String(name)}
              type={String(type)}
              required
              minLength={name === 'email' ? undefined : 2}
              maxLength={Number(max)}
              autoComplete={name === 'name' ? 'name' : name === 'email' ? 'email' : 'organization'}
              aria-invalid={!!fields[String(name)]}
              aria-describedby={fields[String(name)] ? `${name}-error` : undefined}
            />
            {fields[String(name)] && (
              <small className="field-error" id={`${name}-error`}>
                {fields[String(name)]}
              </small>
            )}
          </label>
        ))}
        <label className="field">
          <span>
            Area of interest <small>Optional</small>
          </span>
          <select
            name="service"
            defaultValue={services.some((p) => p.slug === selected) ? selected : ''}
          >
            <option value="">Let’s explore together</option>
            {services.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.title.replace(/\n/g, ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>
            Country <small>Optional</small>
          </span>
          <select name="country">
            <option value="">Select your country</option>
            <option value="IN">India</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label className="field">
          <span>
            Industry <small>Optional</small>
          </span>
          <select name="industry">
            <option value="">Other / not sure</option>
            {industries.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.title.replace(/\n/g, ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>
            Process area <small>Optional</small>
          </span>
          <select name="processArea">
            <option value="">Not sure yet</option>
            <option value="software-delivery">Software delivery</option>
            <option value="operations">Operations</option>
            <option value="reporting">Reporting</option>
            <option value="customer-handling">Customer handling</option>
            <option value="administration">Administration</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="field full">
          <span>
            What would you like to change? <small>Required</small>
          </span>
          <textarea
            name="message"
            required
            minLength={20}
            maxLength={3000}
            rows={5}
            placeholder="Tell us about the business problem or opportunity."
            aria-invalid={!!fields.message}
            aria-describedby="message-help message-error"
          />
          <small id="message-help">
            20–3,000 characters. Avoid confidential records and sensitive personal information.
          </small>
          <small id="message-error" className="field-error">
            {fields.message}
          </small>
        </label>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          Leave this empty
          <input name="website" autoComplete="off" tabIndex={-1} />
        </label>
      </div>
      <label className="privacy-check">
        <input type="checkbox" name="privacy" required />
        <span>
          I acknowledge the{' '}
          <Link href="/privacy" target="_blank">
            privacy information
          </Link>{' '}
          about this enquiry. This does not subscribe me to marketing.
        </span>
      </label>
      <button disabled={busy} className="button primary" type="submit">
        {busy ? 'Saving your enquiry…' : 'Start the conversation'}
        <span aria-hidden="true">↗</span>
      </button>
      <p className="form-note">
        {local
          ? 'Local evaluation: submissions are stored on this computer. Please use test information.'
          : 'Your submission is a request for a conversation, not a confirmed appointment.'}
      </p>
    </form>
  );
}
