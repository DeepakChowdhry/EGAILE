// Read-only setup checks. Output contains flags, never credentials or enquiry data.
import { loadEnvFile } from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
loadEnvFile('.env.local');
const ready = (key) => !!process.env[key]?.trim();
let storageAvailable = false;
try {
  const app = initializeApp(
    {
      projectId: process.env.FIREBASE_PROJECT_ID,
      credential: applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    },
    'qa-readiness',
  );
  [storageAvailable] = await getStorage(app).bucket().exists();
} catch {
  /* access failure is recorded as unverified, not leaked */
}
const results = [
  {
    id: 'CLOUD-ENQUIRY',
    name: 'Real Firebase enquiry submission',
    status: 'BLOCKED',
    evidence:
      ready('NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY') && ready('TRUSTED_CLIENT_IP_HEADER')
        ? 'Cloud write was not authorised by automatic approval review.'
        : 'App Check site key and trusted proxy header are not configured. Cloud write was also rejected by automatic approval review; no enquiry was sent.',
  },
  {
    id: 'CLOUD-MEDIA',
    name: 'Real Firebase image storage',
    status: storageAvailable ? 'NOT RUN' : 'BLOCKED',
    evidence: storageAvailable
      ? 'Bucket metadata readable; real upload not attempted.'
      : 'Configured Storage bucket is absent or not accessible; local image upload passed.',
  },
  {
    id: 'EMAIL',
    name: 'Real enquiry email delivery and worker',
    status: 'BLOCKED',
    evidence:
      'Email provider, sender, recipient and dispatch secret still require configuration. Persistence and mocked delivery/retry behaviour passed.',
  },
  {
    id: 'ANALYTICS',
    name: 'Live GA4 consent and event delivery on egaile.com',
    status: 'NOT RUN',
    evidence:
      'Analytics deliberately disabled locally and requires production on the exact public domain. Consent policy and enabled CSP regression passed; no live collection asserted.',
  },
  {
    id: 'CLOUD-GOOGLE',
    name: 'Fresh real Google popup sign-in and cloud staff-access changes',
    status: 'NOT RUN',
    evidence:
      'No real account or membership changed. Emulator identity/session/rule checks passed; connected anonymous admin requests are denied and the local shortcut is rejected.',
  },
];
await mkdir('test-results', { recursive: true });
await writeFile(
  'test-results/readiness.json',
  JSON.stringify({ date: new Date().toISOString(), results }, null, 2),
);
console.log(JSON.stringify(results, null, 2));
