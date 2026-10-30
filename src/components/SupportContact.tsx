import { supportPhone, supportWhatsApp, supportEmail } from '@/lib/enquiry-options';
export function SupportContact() {
  return (
    <div className="support-contact">
      <strong>Support Team</strong>
      <a href="tel:+919310424041">{supportPhone}</a>
      <a
        className="support-whatsapp"
        href={supportWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z" />
          <path d="M8 7.5c-.8 2.7 3 6.6 5.9 7.1.8.1 1.8-.9 1.8-1.6l-2-1-1 1c-1.5-.6-2.7-1.8-3.3-3.2l.8-1-1-2Z" />
        </svg>
        Chat on WhatsApp
      </a>
      <a
        className="support-email"
        href={`mailto:${supportEmail}?subject=${encodeURIComponent('Business enquiry — EGAILE')}`}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 6 9 7 9-7" />
        </svg>
        {supportEmail}
      </a>
    </div>
  );
}
