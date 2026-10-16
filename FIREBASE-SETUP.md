# EGAILE Firebase setup

Status: cloud project created and verified on 16 October 2026. Local backend connection and first owner access are pending.

## Created cloud resources

- Project: **EGAILE**, ID `egaile-c28ac`, number `631811194995`, Spark plan. No billing upgrade.
- Web app: **EGAILE Website**, app ID `1:631811194995:web:dd6f01ed1ffc242bd1aa06`.
- Authentication: **Google only**, public-facing name EGAILE. Email/password, anonymous and phone sign-in have not been enabled.
- Firestore: Standard `(default)` database, **asia-south1 (Mumbai)**. Console rules deny every client read and write. No business records or owner memberships have been seeded.
- Analytics account: `412325973`, property: `559286990`, stream: `16144052641`, measurement ID: `G-8KTY62SH66`, website: `https://www.egaile.com`.
- Analytics business country **India**, all four optional account data-sharing choices disabled and verified after reload. Enhanced measurement is off; no visitor data has been received.
- Public Firebase configuration is prepared separately in ignored `.env.firebase`. It is not a service-account credential. `.env.local` continues to use the local adapter until server access is ready.

## Public website and staff access

- Public pages and the contact journey do not require visitor accounts, including anonymous Firebase accounts.
- The footer's **Admin login** opens `/admin/login`. Protected operations require both verified Firebase identity and an active staff membership.
- Signing in to Google does not by itself grant administration rights. The founder's first owner membership must be explicitly bootstrapped.
- Do not enable a public registration flow or grant staff permissions to all authenticated users.

## Traffic reporting

Use a separate EGAILE Google Analytics property linked to the Firebase web app for visitor activity: users, sessions, page views, acquisition sources, devices and engagement. Reporting does not require visitors to log in.

Google Analytics automatically excludes known bots. Hosting request logs and monitoring are needed separately to inspect automated requests, errors and abuse; neither source guarantees perfect human/bot classification. Requests are not unique people. Consent choices, blockers and disabled JavaScript also affect Analytics counts.

The application now implements opt-in Analytics, a persistent preference/withdrawal control and 180-day preference expiry. It loads no Google measurement script until consent, only in production on the exact EGAILE public domains. Approved public page paths are measured; query strings, form contents and private routes are omitted. Local/staging hosts and private draft frames are excluded. Enhanced measurement is off in the console to avoid automatic forms/history events and duplicate page views. Browser consent/network and reporting verification remains a deployment task before `NEXT_PUBLIC_ANALYTICS_ENABLED=true`. The public privacy notice still needs the actual business and provider details before launch.

## Pending connection steps

The Google-only login UI is implemented. The first Google identity must be registered and explicitly granted the owner role; no Google account automatically becomes a website admin.

Authorise a local backend through Google's supported Application Default Credentials flow or deploy using a managed runtime identity. Never copy browser cookies, use a Firebase CLI token as a service credential, or commit a private service-account key. The existing bootstrap script grants the first owner only after the account exists and server access is available. Creating the owner role requires explicit approval.

Account country is not a guarantee that all Analytics processing stays in that country. Additional Data Processing Terms have not been accepted; review applicability before launch. Storage, App Hosting and background workers require a separate billing decision. Domain/DNS, deployment, email delivery, App Check, server identity and live Analytics are not completed. The application remains local for now.

Official references:
- https://firebase.google.com/docs/analytics/web/get-started
- https://support.google.com/analytics/answer/9888366
