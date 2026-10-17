'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { SiteContent } from '@/lib/content';
import { BrandLogo } from './BrandLogo';
export function Header({ site }: { site: SiteContent }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" onClick={() => setOpen(false)} aria-label="EGAILE home">
          <BrandLogo />
        </Link>
        <nav aria-label="Main navigation" className="main-nav">
          {site.menu.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="header-contact" href="/contact">
          Let’s talk <span aria-hidden="true">↗</span>
        </Link>
        <button
          className="menu-button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}
          <span aria-hidden="true">{open ? '×' : '☰'}</span>
        </button>
      </div>
      <nav id="mobile-nav" className="mobile-nav" hidden={!open} aria-label="Mobile navigation">
        {site.menu.map((item, i) => (
          <Link key={i} href={item.href} onClick={() => setOpen(false)}>
            {item.label} ↗
          </Link>
        ))}
        <Link href="/contact" onClick={() => setOpen(false)}>
          Start a conversation ↗
        </Link>
      </nav>
    </header>
  );
}
