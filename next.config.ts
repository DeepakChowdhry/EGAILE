import type { NextConfig } from 'next';
const config: NextConfig = {
  serverExternalPackages: ['firebase-admin'],
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    const policy =
      "default-src 'self'; script-src 'self' 'unsafe-inline' " +
      (process.env.NODE_ENV === 'development' ? "'unsafe-eval' " : '') +
      "https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://firebaseappcheck.googleapis.com " +
      (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:9099 ' : '') +
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
