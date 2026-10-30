'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { ContentPage } from '@/lib/content';
import {
  additionalIndustries,
  additionalServices,
  processAreas,
  supportEmail,
} from '@/lib/enquiry-options';

export function EnquiryForm({
  services,
  industries,
  selected = '',
}: {
  services: ContentPage[];
  industries: ContentPage[];
  selected?: string;
  local: boolean;
  onlineAvailable?: boolean;
}) {
  const [emailDraft, setEmailDraft] = useState(''),
    [emailText, setEmailText] = useState(''),
    [emailConfirmed, setEmailConfirmed] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (String(data.get('website') || '')) return;
    const value = (name: string) => String(data.get(name) || '').trim();
    const optionLabel = (name: string) =>
      (form.elements.namedItem(name) as HTMLSelectElement).selectedOptions[0]?.textContent ||
      'Not specified';
    const message = [
      'Hello Support Team,',
      '',
      'I would like to discuss a business enquiry.',
      `Name: ${value('name')}`,
      `Email: ${value('email')}`,
      `Company: ${value('company')}`,
      'Country: India',
      `Area of interest: ${optionLabel('service')}`,
      `Industry: ${optionLabel('industry')}`,
      `Process area: ${optionLabel('processArea')}`,
      '',
      'Enquiry:',
      value('message'),
    ].join('\r\n');
    const subject = 'Business enquiry — EGAILE';
    const draft = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    setEmailText(message);
    setEmailDraft(draft);
    setEmailConfirmed(false);
    // Preparing an email is not evidence that the visitor has sent it.
    window.location.assign(draft);
  }

  const emailReview = emailDraft ? (
    <div className="receipt-panel" role="status">
      {emailConfirmed ? (
        <>
          <span className="receipt-icon" aria-hidden="true">
            ✓
          </span>
          <p className="eyebrow">THANK YOU</p>
          <h2>Thank you for sharing your enquiry!</h2>
          <p>
            You’ve confirmed that your enquiry has been emailed to the Support Team.
            Please check the sending mailbox for any replies.
          </p>
          <Link className="button primary" href="/">Back to EGAILE</Link>
        </>
      ) : (
        <>
          <h2>Your enquiry email is ready</h2>
          <p>Review your email to {supportEmail} and press Send in your email app. Once you’ve sent it, confirm below.</p>
          <a className="button primary" href={emailDraft}>Open enquiry email</a>
          <button className="button whatsapp-confirm" type="button" onClick={() => setEmailConfirmed(true)}>
            I’ve sent my enquiry
          </button>
          <button className="text-link" type="button" onClick={() => setEmailDraft('')}>Edit enquiry</button>
          <details className="email-draft-details">
            <summary>Email app didn’t open?</summary>
            <p>Compose an email to {supportEmail} with the subject “Business enquiry — EGAILE”, then copy the details below into your message.</p>
            <label className="field">
              Enquiry details to copy
              <textarea readOnly value={emailText} rows={10} onFocus={(event) => event.currentTarget.select()} />
            </label>
          </details>
          <p className="form-note">This page cannot check whether an email was sent. Confirm only after pressing Send in your email app.</p>
        </>
      )}
    </div>
  ) : null;
  return (
    <div className="enquiry-form">
      {emailReview}
      <form onSubmit={submit} hidden={!!emailDraft}>
        <p className="form-notice">
          Complete the form to prepare an email to {supportEmail}. Review the details in your email
          app and press Send.
        </p>
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
              />
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
              aria-describedby="message-help"
            />
            <small id="message-help">
              20–3,000 characters. Avoid confidential records and sensitive personal information.
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
        <button className="button primary" type="submit">
          Continue to email
          <span aria-hidden="true">↗</span>
        </button>
        <p className="form-note">
          Your email app sends the enquiry from your signed-in mailbox. Please use the email address
          entered above if you would like replies in that inbox.
        </p>
      </form>
    </div>
  );
}
