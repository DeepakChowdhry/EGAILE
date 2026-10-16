import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://www.egaile.com'),
  title: { default: 'EGAILE | Better processes. Smarter business.', template: '%s | EGAILE' },
  description:
    'IT consultancy for SMEs across industries, improving processes through practical AI, automation and technology.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
