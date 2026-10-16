'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { SiteContent } from '@/lib/content';
export function Hero({ hero }: { hero: SiteContent['hero'] }) {
  const [paused, setPaused] = useState(true),
    [visible, setVisible] = useState(true);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setPaused(media.matches);
    change();
    media.addEventListener('change', change);
    const observer = new IntersectionObserver((e) => setVisible(e[0].isIntersecting));
    if (ref.current) observer.observe(ref.current);
    const visibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      media.removeEventListener('change', change);
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const moving = hero.animation && !paused && visible;
  return (
    <section
      ref={ref}
      className={`hero ${moving ? 'is-moving' : ''}`}
      aria-labelledby="hero-heading"
    >
      <div className="hero-visual">
        {hero.image && (
          <img
            src={hero.image}
            alt={hero.imageDecorative ? '' : hero.imageAlt}
            fetchPriority="high"
            width="1672"
            height="941"
          />
        )}
      </div>
      <div className="hero-shade" />
      <div className="hero-orbit" aria-hidden="true" />
      <div className="container hero-content">
        <p className="eyebrow light">
          <span /> {hero.eyebrow}
        </p>
        <h1 id="hero-heading">{hero.title}</h1>
        <p className="hero-description">{hero.description}</p>
        <div className="hero-actions">
          <Link href={hero.ctaHref} className="button primary">
            {hero.ctaLabel}
            <span aria-hidden="true">↗</span>
          </Link>
          <Link className="hero-secondary" href="/approach">
            Discover our approach <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="container hero-bottom">
        <div className="motion-control">
          {hero.animation && (
            <button
              aria-label={paused ? 'Play hero animation' : 'Pause hero animation'}
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              {paused ? '▶' : 'Ⅱ'}
            </button>
          )}
          <span>PROCESS INSIGHT. PRACTICAL IMPROVEMENT.</span>
        </div>
        <a href="#explore" className="scroll-link">
          Explore EGAILE <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
