import { readContent } from '@/server/content-repository';
import { Shell, ServiceCards, Closing } from '@/components/Site';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Our capabilities' };
export default async function Page() {
  const { site } = await readContent();
  return (
    <Shell site={site}>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">WHAT WE DO</p>
          <h1>
            Business priorities.
            <br />
            Connected possibilities.
          </h1>
          <p className="page-summary">
            Explore practical starting points for transformation, from understanding the challenge
            to redesigning the work.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <ServiceCards pages={site.pages.filter((p) => p.type === 'service' && p.published)} />
        </div>
      </section>
      <Closing />
    </Shell>
  );
}
