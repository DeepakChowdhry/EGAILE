import { readContent } from '@/server/content-repository';
import { Shell, ServiceCards } from '@/components/Site';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Insights' };
export default async function Page() {
  const { site } = await readContent();
  const articles = site.pages.filter((p) => p.type === 'article' && p.published);
  return (
    <Shell site={site}>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">EGAILE INSIGHTS</p>
          <h1>
            Thinking about
            <br />
            what comes next.
          </h1>
          <p className="page-summary">
            {articles.length
              ? 'Perspectives on business transformation.'
              : 'Our first perspectives are being prepared. Explore our approach in the meantime.'}
          </p>
        </div>
      </section>
      {articles.length > 0 && (
        <section className="section">
          <div className="container">
            <ServiceCards pages={articles} />
          </div>
        </section>
      )}
    </Shell>
  );
}
