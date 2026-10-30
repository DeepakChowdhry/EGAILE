import { readContent } from '@/server/content-repository';
import { Shell } from '@/components/Site';
import { EnquiryForm } from '@/components/EnquiryForm';
import { backend } from '@/server/db';
import { SupportContact } from '@/components/SupportContact';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Start a conversation' };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    service?: string;
  }>;
}) {
  const { site } = await readContent();
  const { service } = await searchParams;
  return (
    <Shell site={site}>
      <section className="page-hero contact-hero">
        <div className="container">
          <p className="eyebrow">LET’S TALK</p>
          <h1>
            Start with the
            <br />
            business problem.
          </h1>
          <p className="page-summary">
            You don’t need all the answers. Just a question worth exploring.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container contact-grid">
          <aside>
            <p className="eyebrow">A USEFUL FIRST CONVERSATION</p>
            <h2>
              What matters
              <br />
              to your business?
            </h2>
            <p className="section-description">{site.contactNote}</p>
            <div className="contact-expectations">
              <span>01 / Share your priorities</span>
              <span>02 / Explore the context</span>
              <span>03 / Agree a suitable next step</span>
            </div>
            <SupportContact />
            {site.contactEmail && (
              <a className="text-link" href={'mailto:' + site.contactEmail}>
                {site.contactEmail} ↗
              </a>
            )}
          </aside>
          <EnquiryForm
            services={site.pages.filter((p) => p.type === 'service' && p.published)}
            industries={site.pages.filter((p) => p.type === 'industry' && p.published)}
            selected={service}
            local={backend() === 'local'}
            onlineAvailable={
              backend() === 'local'
                ? process.env.NODE_ENV !== 'production'
                : !!(
                    process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY &&
                    process.env.NEXT_PUBLIC_BACKEND === 'firebase' &&
                    process.env.PUBLIC_LAUNCH_APPROVED === 'true' &&
                    process.env.TRUSTED_CLIENT_IP_HEADER &&
                    process.env.RATE_LIMIT_SECRET
                  )
            }
          />
        </div>
      </section>
    </Shell>
  );
}
