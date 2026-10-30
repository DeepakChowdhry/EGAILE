import Link from 'next/link';
import type { Section } from '@/lib/content';
export function AboutEgaile({ section: s }: { section: Section }) {
  const imageCaption =
    s.imageCaption === 'AI-generated illustrations of SME workplaces.'
      ? 'Collaboration and everyday operations in small businesses.'
      : s.imageCaption;
  return (
    <section className="about-egaile" id="about-egaile" aria-labelledby={`about-${s.id}`}>
      <div className="container about-egaile-grid">
        <div className="about-photos">
          {s.image && (
            <img
              className="about-photo-main"
              src={s.image}
              alt={s.imageAlt || ''}
              width={1200}
              height={800}
              loading="lazy"
            />
          )}
          <div className="about-photo-note">
            <p>
              Better ways of working.
              <br />
              <strong>Built around people.</strong>
            </p>
          </div>
          {s.secondaryImage && (
            <img
              className="about-photo-secondary"
              src={s.secondaryImage}
              alt={s.secondaryImageAlt || ''}
              width={900}
              height={675}
              loading="lazy"
            />
          )}
          {imageCaption && <p className="about-image-caption">{imageCaption}</p>}
        </div>
        <div className="about-egaile-copy">
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 id={`about-${s.id}`}>{s.title}</h2>
          {s.body.split('\n\n').map((p, i) => (
            <p className="about-paragraph" key={i}>
              {p}
            </p>
          ))}
          <div className="about-principles">
            {s.items.map((item, i) => (
              <div key={i}>
                <span aria-hidden="true">0{i + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
          {s.linkLabel && (
            <Link className="text-link" href={s.linkHref}>
              {s.linkLabel} ↗
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
