# EGAILE website

Working development build for EGAILE's IT consultancy website. React and Next.js provide the public pages and admin workspace; Firebase Authentication, Firestore and Storage are the cloud adapters. There is no EGAILE Firebase cloud project connected yet.

The supplied repository was empty. This implementation reuses suitable components from the earlier local EGAILE prototype, replaces the older manufacturing-led content with the approved cross-industry offer, and replaces its SQL backend with a document-store contract and Firebase adapter. The local development adapter uses SQLite and is deliberately disabled in production. No earlier passwords, private database, environment credentials or client records were copied.

## Run locally

Use Node.js 24 LTS (minimum supported Node version 22.13). On Windows, double-click `Start-EGAILE.cmd`, or run:

```sh
npm ci
```

Copy `.env.example` to `.env.local`, keeping the initial local settings. Then:

```sh
npm run dev
```

Open `http://127.0.0.1:3010`. The admin entry is `/admin/login`. The explicit local-workspace shortcut works only in development mode with a loopback origin. It cannot authenticate a production deployment. Local content and test enquiries persist in `.data/`, which is excluded from Git.

## Implemented capabilities

- Six service pages, SME and software-company journeys, approach/about pages, contact and temporary privacy information.
- Responsive navigation, original prototype artwork, darker body text and a hero with motion controls and reduced-motion support.
- Saved drafts, explicit publication, version verification, conflict rejection, revision recovery, content import/export and protected desktop/mobile previews.
- Page templates, homepage section arrangement, menu/contact/SEO editing, image optimisation, upload validation and alt text/decorative designation.
- Durable enquiries with optional service, industry and process context, historical labels, idempotent capture and atomic notification tasks.
- Private enquiry follow-up with bounded status transitions, displayed-record CSV export, deletion permissions and failed-notification requeue.
- Firebase email/password and optional Google sign-in, secure server sessions, active staff membership checks and owner/editor/publisher/operator permissions.
- Firebase background-delivery trigger and scheduled recovery worker, configurable email adapter and future payment/CRM adapter contracts.
- GitHub verification workflow and Firebase deployment templates. Deployment has not been performed.

## Verify

```sh
npm run typecheck
npm test
npm run functions:build
npm run build
```

With the local development server running, `npm run test:http` tests routes, access denial, origin controls, draft isolation, uploads and enquiry workflows. It creates clearly labelled synthetic records and restores the content it changes. Do not point it at a live customer deployment.

The repository tests also run against Google's local Firestore and Auth emulators. Install Java 21 or later and use the Firebase CLI from this project. Set `EGAILE_BACKEND=firebase`, `FIREBASE_PROJECT_ID=demo-egaile` and a synthetic `RATE_LIMIT_SECRET`, then run:

```sh
npx firebase emulators:exec --project demo-egaile --only auth,firestore "node --import tsx --test tests/*.test.ts"
```

The demo project is not a live Google Cloud project. Tests include concurrency, atomic writes, duplicate submission, transaction rollback, role separation, revoked sessions, direct database access denial and failed-provider recovery. See `IMPLEMENTATION-STATUS.md` for completed checks and remaining work. Passing emulator tests does not establish production IAM, quotas, load capacity or uptime.

## Connect Firebase

1. Create separate EGAILE staging and production projects under founder-controlled ownership. Do not reuse Knovexa data, users or secrets.
2. Confirm regions, billing exposure and actual Google AI Pro credit eligibility. Firebase App Hosting, Functions and Cloud Storage need appropriate billing configuration; no assumption of permanently free operation is made.
3. Register the web app and configure the public Firebase client values in `.env.example`. These public values are different from private server credentials. Set both backend variables to `firebase` and disable local owner mode.
4. Configure Firebase Authentication sign-in methods, authorised domains, owner protection and account recovery. Create the founder's account through the Firebase console or the approved sign-in flow. With authorised ADC credentials and the project ID set, run `npm run owner:bootstrap -- owner@example.com`. It grants only the first owner and never prints credentials or sends an invitation.
5. Deploy deny-by-default Firestore/Storage rules and required indexes. The backend verifies identity and permissions for every operation; Admin SDK requests use IAM and bypass client Security Rules.
6. Configure the bucket, managed runtime identity, Secret Manager, App Check web provider and the verified hosting proxy's client-IP header. Public enquiry acceptance fails closed until these controls are configured.
7. Configure an approved email provider. The initial adapter is Resend; notification emails contain only a reference and a request to use the protected dashboard. Provider credentials stay server-side. Build and deploy the delivery and recovery functions. The default Functions region is a proposal to review, not proof of an approved residency decision.
8. Configure App Hosting from the GitHub repository and `apphosting.yaml`, including all missing project-specific variables. Keep `PUBLIC_LAUNCH_APPROVED=false` until the release checks are complete. Never copy `.env.local` or a service-account key into GitHub.
9. Complete staging validation, real-role negative tests, restore drill, verified sender, monitoring/alerts, budget controls, final public notices and approved business details. Then connect the existing domain and deliberately enable launch. DNS and billing have not been changed by this build.

## Source map

- `src/lib/seed.json`: approved initial editable content.
- `src/lib/content.ts`: page/block schemas and link validation.
- `src/server/db.ts`: document-store boundary, local adapter and Firestore adapter.
- `src/server/content-repository.ts`: private drafts, publication, revisions and redirects.
- `src/server/auth.ts` and `src/lib/permissions.ts`: verified identity and per-action access.
- `src/server/enquiries.ts` and `src/server/delivery.ts`: atomic acceptance and leased background delivery.
- `src/components/Editor.tsx`: routine founder management.
- `functions/src/index.ts`: notification trigger and recovery schedule.
- `src/server/integrations/contracts.ts`: later provider interfaces, with no payments enabled.

## Current boundaries

The initial editor accepts at most 150 pages and a 280 KB total content payload. Draft pages are stored as individual records; the public snapshot and recovery revisions are bounded aggregates. Enquiry screens show the latest 100 records and export the displayed set. These explicit limits prevent unbounded work; larger catalogues and full historical exports require pagination/storage extensions and testing before increasing limits.

The deployment templates do not provision backups, retention jobs, alert channels, MFA, billing caps, legal notices or provider accounts. Those must be configured and verified for the real project. Application request logging uses safe error identifiers; infrastructure monitoring remains a release task. No availability or recovery target is reported as achieved.

Payments, customer portals, arbitrary external-website fetching and automatic AI consultancy are not launch features. Add approved providers behind server-side contracts with signatures, deduplication, timeouts and recovery tests. A new integration is technical work, while implemented content and settings remain editable without code.

For future AI Studio work, preserve the Next.js structure, locked dependencies, access boundaries and tests. Do not convert the backend into browser code or replace server credentials with public environment variables.
