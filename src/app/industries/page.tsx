import { readContent } from '@/server/content-repository';
import { Shell, ServiceCards, Closing } from '@/components/Site';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Industries' };
export default async function Page() {
  const { site } = await readContent();
  return (
    <Shell site={site}>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">INDUSTRY PERSPECTIVES</p>
          <h1>
            Grounded in
            <br />
            the way you work.
          </h1>
          <p className="page-summary">
            Start with the operating realities of your business, then identify the right
            opportunities for change.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <ServiceCards pages={site.pages.filter((p) => p.type === 'industry' && p.published)} />
        </div>
      </section>
      <Closing />
    </Shell>
  );
}
