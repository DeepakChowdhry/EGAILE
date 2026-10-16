import Link from 'next/link';
import type { ContentPage, SiteContent, Section } from '@/lib/content';
import { pagePath } from '@/lib/content';
import { Header } from './Header';
import { Hero } from './Hero';
import { TrafficAnalytics } from './TrafficAnalytics';
export function Shell({
  site,
  children,
  preview = false,
}: {
  site: SiteContent;
  children: React.ReactNode;
  preview?: boolean;
}) {
  return (
    <div data-theme={site.theme}>
      {preview && (
        <div className="preview-banner">
          Draft preview — visible only to the signed-in owner.{' '}
          <Link href="/admin">Return to editor ↗</Link>
        </div>
      )}
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header site={site} />
      <main id="main">{children}</main>
      <Footer site={site} />
      {!preview && (
        <TrafficAnalytics
          publicPaths={[
            '/',
            '/services',
            '/industries',
            '/approach',
            '/about',
            '/contact',
            '/insights',
            '/privacy',
            '/cookies',
            ...site.pages.filter((p) => p.published).map(pagePath),
          ]}
        />
      )}
    </div>
  );
}
export function Footer({ site }: { site: SiteContent }) {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <Link href="/" className="footer-brand">
          EGAILE<span>.</span>
        </Link>
        <p>
          {site.tagline}
          <br />
          <small>Process insight. Practical AI. Better ways of working.</small>
        </p>
        <Link href="/contact" className="footer-conversation">
          Let’s start a conversation ↗
        </Link>
      </div>
      <div className="container footer-bottom">
        <span>Intended markets: India · United Kingdom · United States</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/admin/login">Admin login ↗</Link>
        </div>
      </div>
      <div className="container footer-legal">
        © {new Date().getFullYear()} EGAILE. Website preview. Public launch details are being
        finalised.
      </div>
    </footer>
  );
}
export function ServiceArt({ index }: { index: number }) {
  return (
    <div className={`service-art art-${index % 3}`} aria-hidden="true">
      <span className="art-orbit" />
      <span className="art-orbit second" />
      <span className="art-core" />
      <span className="art-grid" />
      <span className="art-caption">
        {['SEE THE WHOLE SYSTEM', 'DESIGN BETTER FLOW', 'DISCOVER WHAT’S POSSIBLE'][index % 3]}
      </span>
    </div>
  );
}
export function ServiceCards({ pages }: { pages: ContentPage[] }) {
  return (
    <div className="service-grid">
      {pages.map((page, i) => (
        <Link href={pagePath(page)} className="service-card" key={page.id}>
          <ServiceArt index={i} />
          <div className="service-card-body">
            <p className="card-index">
              0{i + 1} / {page.type === 'service' ? 'CAPABILITY' : page.type.toUpperCase()}
            </p>
            <h3>{page.title}</h3>
            <p>{page.summary}</p>
            <span className="card-link">
              Explore {page.type === 'service' ? 'the service' : page.type}
              <span className="round-arrow" aria-hidden="true">
                ↗
              </span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
export function Home({ site, preview = false }: { site: SiteContent; preview?: boolean }) {
  return (
    <Shell site={site} preview={preview}>
      <Hero hero={site.hero} />
      <div className="market-strip">
        <div className="container">
          <span>PROCESS FIRST. TECHNOLOGY WITH PURPOSE.</span>
          <span>Built around your business. Designed for what comes next.</span>
        </div>
      </div>
      <div id="explore">
        {site.sections
          .filter((s) => s.enabled)
          .map((section) => (
            <ContentSection key={section.id} section={section} site={site} />
          ))}
      </div>
    </Shell>
  );
}
export function ContentSection({ section: s, site }: { section: Section; site: SiteContent }) {
  if (s.type === 'cta')
    return (
      <section className="closing">
        <div className="container closing-inner">
          <div>
            <p className="eyebrow light">{s.eyebrow}</p>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </div>
          <Link className="button white" href={s.linkHref}>
            {s.linkLabel}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    );
  if (s.type === 'spotlight')
    return (
      <section className="spotlight">
        <div className="container spotlight-grid">
          <div className="spotlight-image">
            <img
              src={site.hero.image || '/hero.jpg'}
              alt="Conceptual connected enterprise architecture"
              loading="lazy"
              width="1672"
              height="941"
            />
            <span>TRANSFORM THE PROCESS. THEN THE POSSIBILITIES.</span>
          </div>
          <div className="spotlight-copy">
            <p className="eyebrow">{s.eyebrow}</p>
            <h2>{s.title}</h2>
            <p className="section-description">{s.body}</p>
            <div className="spotlight-items">
              {s.items.map((x, i) => (
                <div key={i}>
                  <h3>{x.title}</h3>
                  <p>{x.body}</p>
                </div>
              ))}
            </div>
            <Link className="text-link" href={s.linkHref}>
              {s.linkLabel} ↗
            </Link>
          </div>
        </div>
      </section>
    );
  return (
    <section className={`section section-${s.type}`}>
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{s.eyebrow}</p>
            <h2>{s.title}</h2>
          </div>
          <div>
            {s.type !== 'text' && <p className="section-description">{s.body}</p>}
            {s.linkLabel && (
              <Link className="text-link" href={s.linkHref}>
                {s.linkLabel} ↗
              </Link>
            )}
          </div>
        </div>
        {s.type === 'services' && (
          <ServiceCards pages={site.pages.filter((p) => p.type === 'service' && p.published)} />
        )}
        {s.type === 'method' && (
          <div className="method-grid">
            {s.items.map((x, i) => (
              <article key={i}>
                <span className="method-number">
                  0{i + 1}
                  <span aria-hidden="true">↗</span>
                </span>
                <h3>{x.title}</h3>
                <p>{x.body}</p>
                <span className="method-line" />
              </article>
            ))}
          </div>
        )}
        {s.type === 'faq' && (
          <div className="faq-list">
            {s.items.map((x, i) => (
              <details key={i}>
                <summary>
                  {x.title}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{x.body}</p>
              </details>
            ))}
          </div>
        )}
        {s.type === 'text' && (
          <div className="rich-content">
            {s.body.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {s.items.map((x, i) => (
              <article key={i}>
                <h3>{x.title}</h3>
                <p>{x.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
export function PageDetail({ site, page }: { site: SiteContent; page: ContentPage }) {
  return (
    <Shell site={site}>
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Home</Link> /{' '}
            {page.type === 'service' ? (
              <Link href="/services">Solutions</Link>
            ) : page.type === 'industry' ? (
              <Link href="/industries">Industries</Link>
            ) : (
              'EGAILE'
            )}
          </p>
          <p className="eyebrow">
            {page.type === 'service'
              ? 'OUR CAPABILITIES'
              : page.type === 'industry'
                ? 'INDUSTRY PERSPECTIVE'
                : page.type === 'article'
                  ? 'EGAILE INSIGHTS'
                  : 'OUR PERSPECTIVE'}
          </p>
          <h1>{page.title}</h1>
          <p className="page-summary">{page.summary}</p>
        </div>
      </section>
      <section className="section">
        <div className="container detail-grid">
          <div className="rich-content">
            {page.body.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="detail-aside">
            <p className="eyebrow">
              {page.deliverables.length ? 'WHAT WE EXPLORE' : 'YOUR NEXT STEP'}
            </p>
            {page.deliverables.length > 0 && (
              <ul>
                {page.deliverables.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
            <h3>Start with your business question.</h3>
            <Link
              className="button primary"
              href={'/contact?service=' + (page.type === 'service' ? page.slug : '')}
            >
              Let’s talk ↗
            </Link>
          </aside>
        </div>
      </section>
      <Closing />
    </Shell>
  );
}
export function Closing() {
  return (
    <section className="closing">
      <div className="container closing-inner">
        <div>
          <p className="eyebrow light">LET’S LOOK AHEAD</p>
          <h2>
            A clearer question.
            <br />A better next step.
          </h2>
        </div>
        <Link className="button white" href="/contact">
          Start a conversation ↗
        </Link>
      </div>
    </section>
  );
}
