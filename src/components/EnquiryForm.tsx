'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import type { ContentPage } from '@/lib/content';
import {
  additionalIndustries,
  additionalServices,
  processAreas,
  supportWhatsApp,
} from '@/lib/enquiry-options';
export function EnquiryForm({
  services,
  industries,
  selected = '',
  local,
  onlineAvailable = false,
}: {
  services: ContentPage[];
  industries: ContentPage[];
  selected?: string;
  local: boolean;
  onlineAvailable?: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [fields, setFields] = useState<Record<string, string>>({}),
    [reference, setReference] = useState(''),
    [whatsAppDraft, setWhatsAppDraft] = useState(''),
    [whatsAppOpened, setWhatsAppOpened] = useState(false),
    [whatsAppConfirmed, setWhatsAppConfirmed] = useState(false);
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
    const optionLabel = (name: string) => {
      const select = event.currentTarget.elements.namedItem(name) as HTMLSelectElement;
      return select.selectedOptions[0]?.textContent || 'Not specified';
    };
    const draft =
      supportWhatsApp +
      '?text=' +
      encodeURIComponent(
        [
          'Hello Support Team, I would like to discuss a business enquiry.',
          `Name: ${body.name}`,
          `Email: ${body.email}`,
          `Company: ${body.company}`,
          'Country: India',
          `Area of interest: ${optionLabel('service')}`,
          `Industry: ${optionLabel('industry')}`,
          `Process area: ${optionLabel('processArea')}`,
          '',
          body.message,
        ].join('\n'),
      );
    const viaWhatsApp =
      (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'whatsapp';
    if (!onlineAvailable || viaWhatsApp) {
      setWhatsAppOpened(false);
      setWhatsAppConfirmed(false);
      setWhatsAppDraft(draft);
      setBusy(false);
      return;
    }
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
    } catch {
      setError(
        'We couldn’t save your enquiry online. Your details are still here. Please retry or use the WhatsApp option below.',
      );
      requestAnimationFrame(() => summary.current?.focus());
    } finally {
      setBusy(false);
    }
  }
  const whatsAppReview = whatsAppDraft ? (
    <div className="receipt-panel" role="status">
      {whatsAppConfirmed ? (
        <>
          <span className="receipt-icon" aria-hidden="true">
            ✓
          </span>
          <p className="eyebrow">THANK YOU</p>
          <h2>Thank you for sharing your enquiry!</h2>
          <p>
            You’ve confirmed that your enquiry has been shared with the Support Team on WhatsApp.
            You can continue the conversation in the same chat.
          </p>
          <Link className="button primary" href="/">
            Back to EGAILE
          </Link>
          <a className="text-link" href={supportWhatsApp} target="_blank" rel="noopener noreferrer">
            Open Support Team chat
          </a>
        </>
      ) : (
        <>
          <h2>
            {whatsAppOpened ? 'Have you sent your enquiry?' : 'Your WhatsApp enquiry is ready'}
          </h2>
          <p>
            {whatsAppOpened
              ? 'Once you’ve pressed Send in WhatsApp, confirm below to finish. If you haven’t sent it yet, reopen WhatsApp to review and send your message.'
              : 'Open WhatsApp to review your details and press Send to share them with the Support Team.'}
          </p>
          <a
            className="button primary"
            href={whatsAppDraft}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setWhatsAppOpened(true)}
          >
            {whatsAppOpened ? 'Reopen WhatsApp' : 'Review and send in WhatsApp'}
          </a>
          {whatsAppOpened && (
            <button
              className="button whatsapp-confirm"
              type="button"
              onClick={() => setWhatsAppConfirmed(true)}
            >
              I’ve sent my enquiry
            </button>
          )}
          <button className="text-link" type="button" onClick={() => setWhatsAppDraft('')}>
            Edit enquiry
          </button>
          {whatsAppOpened && (
            <p className="form-note">
              WhatsApp does not notify this page when a message is sent. Please confirm only after
              sending it.
            </p>
          )}
        </>
      )}
    </div>
  ) : null;
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
    <div className="enquiry-form">
      {whatsAppReview}
      <form onSubmit={submit} hidden={!!whatsAppDraft}>
        {!onlineAvailable && (
          <p className="form-notice">
            Send your enquiry to our Support Team on WhatsApp. Complete the form, then review and
            send your message in WhatsApp.
          </p>
        )}
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
                autoComplete={
                  name === 'name' ? 'name' : name === 'email' ? 'email' : 'organization'
                }
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
              {additionalServices
                .filter((option) => !services.some((p) => p.slug === option.value))
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
            <input name="country" type="hidden" value="IN" />
            <input aria-label="Country" value="India" readOnly autoComplete="country-name" />
          </label>
          <label className="field">
            <span>
              Industry <small>Optional</small>
            </span>
            <select name="industry">
              <option value="">Other / not sure</option>
              {additionalIndustries
                .filter((option) => !industries.some((p) => p.slug === option.value))
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
              {processAreas.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
          {busy
            ? 'Saving your enquiry…'
            : onlineAvailable
              ? 'Submit enquiry'
              : 'Continue to WhatsApp'}
          <span aria-hidden="true">↗</span>
        </button>
        {onlineAvailable && (
          <button
            className="button whatsapp-button"
            type="submit"
            name="delivery"
            value="whatsapp"
            disabled={busy}
          >
            Send via WhatsApp instead
          </button>
        )}
        <p className="form-note">
          {local
            ? 'Local evaluation: submissions are stored on this computer. Please use test information.'
            : 'Your submission is a request for a conversation, not a confirmed appointment.'}
        </p>
      </form>
    </div>
  );
}
