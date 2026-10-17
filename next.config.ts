import type { NextConfig } from 'next';
const config: NextConfig = {
  distDir: process.env.EGAILE_BUILD_DIR || '.next',
  serverExternalPackages: ['firebase-admin'],
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    // Loading and collection remain gated by consent, production and the public domain.
    const analytics = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
    const policy =
      "default-src 'self'; script-src 'self' 'unsafe-inline' " +
      (process.env.NODE_ENV === 'development' ? "'unsafe-eval' " : '') +
      (analytics ? 'https://www.googletagmanager.com ' : '') +
      "https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://firebaseappcheck.googleapis.com " +
      (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:9099 ' : '') +
      (analytics
        ? 'https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com '
        : '') +
      "; frame-src 'self' https://*.firebaseapp.com https://www.google.com https://www.recaptcha.net; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'";
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: policy },
        ],
      },
      {
        source: '/preview',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Content-Security-Policy',
            value: policy.replace("frame-ancestors 'none'", "frame-ancestors 'self'"),
          },
        ],
      },
    ];
  },
};
export default config;
