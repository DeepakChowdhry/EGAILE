'use client';
import { useId, useRef, useState } from 'react';
import type { Section } from '@/lib/content';
export function TransformationJourney({ section }: { section: Section }) {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const active = Math.min(selected, section.items.length - 1);
  const item = section.items[active];
  if (!item) return null;
  return (
    <section className="journey-section" aria-labelledby={`${id}-heading`}>
      <div className="container">
        <div className="journey-heading">
          <div>
            <p className="eyebrow">{section.eyebrow}</p>
            <h2 id={`${id}-heading`}>{section.title}</h2>
          </div>
          <p>{section.body}</p>
        </div>
        <div className="journey-tabs" role="tablist" aria-label="Our four-stage approach">
          {section.items.map((step, i) => (
            <button
              key={i}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-controls={`${id}-panel`}
              aria-selected={active === i}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setSelected(i)}
              onKeyDown={(event) => {
                const next =
                  event.key === 'ArrowRight'
                    ? (i + 1) % section.items.length
                    : event.key === 'ArrowLeft'
                      ? (i - 1 + section.items.length) % section.items.length
                      : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? section.items.length - 1
                          : null;
                if (next !== null) {
                  event.preventDefault();
                  setSelected(next);
                  buttons.current[next]?.focus();
                }
              }}
            >
              <span className="journey-step">
                STEP {String(i + 1).padStart(2, '0')}
                <span aria-hidden="true">↗</span>
              </span>
              <strong>{step.title}</strong>
            </button>
          ))}
        </div>
        <div
          className="journey-panel"
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${active}`}
          tabIndex={0}
        >
          <div className="journey-main">
            <span className="journey-badge">
              {String(active + 1).padStart(2, '0')} /{' '}
              {String(section.items.length).padStart(2, '0')}
            </span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            {item.outcome && (
              <>
                <h4>What you take away</h4>
                <ul>
                  {item.outcome
                    .split('\n')
                    .filter(Boolean)
                    .map((line, i) => (
                      <li key={i}>
                        <span aria-hidden="true">✓</span>
                        {line}
                      </li>
                    ))}
                </ul>
              </>
            )}
          </div>
          <aside className="journey-checkpoint">
            <p className="eyebrow">A SHARED CHECKPOINT</p>
            <p>{item.checkpoint || 'Review the evidence together and agree the next step.'}</p>
            <div>
              <strong>Move forward with clarity.</strong>
              <p>
                Scope, timing and measures are agreed for your business. Progress is reviewed before
                the next commitment.
              </p>
            </div>
          </aside>
        </div>
        <p className="journey-footnote">
          {section.linkLabel && <a href={section.linkHref}>{section.linkLabel} ↗</a>}
        </p>
      </div>
    </section>
  );
}
