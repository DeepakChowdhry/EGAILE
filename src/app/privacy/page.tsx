import { readContent } from '@/server/content-repository';
import { Shell } from '@/components/Site';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Privacy information' };
export default async function Page() {
  const { site } = await readContent();
  return (
    <Shell site={site}>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">LOCAL EVALUATION / VERSION website-preview-v1</p>
          <h1>Privacy information.</h1>
          <p className="page-summary">
            This development edition is for testing on the owner’s computer. It is not a final
            public privacy policy.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container rich-content narrow">
          <h2>Enquiry information</h2>
          <p>
            The form records the name, email, organisation, message, optional country, service,
            industry and process area, acknowledgement version and source page in the application’s
            configured private database (local SQLite during development, Firestore when connected).
            Use test information during evaluation.
          </p>
          <h2>Access and purpose</h2>
          <p>
            The signed-in owner can review, export and delete enquiries through the dashboard. If an
            email provider is configured later, enquiry information is sent to the owner’s selected
            business inbox for follow-up.
          </p>
          <h2>Cookies and tracking</h2>
          <p>
            Local development does not send visitor analytics. When enabled on the public EGAILE
            domain, optional Google Analytics measures approved public page visits only after you
            choose Allow analytics. Declining does not affect browsing. Cookie preferences let you
            withdraw permission; your preference is stored in this browser for up to 180 days. Query
            strings and form contents are excluded from measurement. Analytics is not a count of
            every request or bot. The admin dashboard uses an essential HTTP-only session cookie,
            which expires after eight hours. Draft previews require that session.
          </p>
          <h2>Before public launch</h2>
          <p>
            The actual business identity, request contact, provider arrangements, retention,
            processing locations and applicable notice must be confirmed. This local notice must be
            replaced before collecting public enquiries.
          </p>
        </div>
      </section>
    </Shell>
  );
}
