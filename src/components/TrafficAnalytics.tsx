'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  consentKey,
  readTrafficChoice,
  trafficAllowed,
  publicTrafficPath,
  type TrafficChoice,
} from '@/lib/traffic-policy';
type TagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
function disable() {
  (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = true;
}
function removeAnalyticsCookies() {
  for (const entry of document.cookie.split(';')) {
    const name = entry.split('=')[0].trim();
    if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) continue;
    for (const domain of [
      '',
      '; domain=egaile.com',
      '; domain=.egaile.com',
      `; domain=${location.hostname}`,
    ])
      document.cookie = `${name}=; max-age=0; path=/${domain}; SameSite=Lax; Secure`;
  }
}
export function TrafficAnalytics({ publicPaths }: { publicPaths: string[] }) {
  const pathname = usePathname();
  const [eligible, setEligible] = useState(false);
  const [choice, setChoice] = useState<TrafficChoice | null>(null);
  const [open, setOpen] = useState(false);
  const initialised = useRef(false);
  useEffect(() => {
    const allowed =
      trafficAllowed(
        location.hostname,
        process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
        process.env.NODE_ENV === 'production',
      ) && window.top === window.self;
    setEligible(allowed);
    if (allowed) {
      let saved: TrafficChoice | null = null;
      try {
        saved = readTrafficChoice(localStorage.getItem(consentKey));
      } catch {
        /* optional storage */
      }
      setChoice(saved);
      setOpen(!saved);
    }
    return disable;
  }, []);
  useEffect(() => {
    if (
      !eligible ||
      choice !== 'accepted' ||
      !/^G-[A-Z0-9]+$/.test(measurementId) ||
      !publicTrafficPath(pathname, publicPaths)
    ) {
      disable();
      return;
    }
    const w = window as TagWindow;
    (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = false;
    if (!initialised.current) {
      w.dataLayer = w.dataLayer || [];
      w.gtag = function () {
        w.dataLayer!.push(arguments);
      };
      w.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      w.gtag('consent', 'update', { analytics_storage: 'granted' });
      w.gtag('js', new Date());
      w.gtag('config', measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: location.origin + pathname,
        page_referrer: '',
        page_title: 'EGAILE',
      });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.dataset.egaileAnalytics = 'true';
      document.head.appendChild(script);
      initialised.current = true;
    }
    // Only approved public paths. No search parameters, form fields, private previews or identity.
    w.gtag?.('set', {
      page_location: location.origin + pathname,
      page_referrer: '',
      page_title: 'EGAILE',
    });
    w.gtag?.('event', 'page_view', {
      send_to: measurementId,
      page_location: location.origin + pathname,
      page_path: pathname,
      page_title: 'EGAILE',
    });
    return disable;
  }, [choice, eligible, pathname, publicPaths]);
  function choose(next: TrafficChoice) {
    try {
      localStorage.setItem(consentKey, JSON.stringify({ choice: next, time: Date.now() }));
    } catch {
      /* works for this visit */
    }
    if (next === 'declined') {
      disable();
      removeAnalyticsCookies();
      if (initialised.current) {
        location.reload();
        return;
      }
    }
    setChoice(next);
    setOpen(false);
  }
  if (!eligible) return null;
  return (
    <div className="traffic-preferences">
      <button className="traffic-settings" onClick={() => setOpen(!open)} aria-expanded={open}>
        Cookie preferences
      </button>
      {open && (
        <section className="traffic-panel" aria-label="Visitor analytics preferences">
          <h2>Help us improve EGAILE.</h2>
          <p>
            With your permission, Google Analytics measures page visits and usage. You can browse
            normally if you decline, and change your choice here anytime.
          </p>
          <a href="/privacy">Privacy information</a>
          <div>
            <button onClick={() => choose('declined')}>Decline analytics</button>
            <button onClick={() => choose('accepted')}>Allow analytics</button>
          </div>
        </section>
      )}
    </div>
  );
}
