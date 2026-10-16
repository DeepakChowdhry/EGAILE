# EGAILE Firebase setup

Status: cloud project and local backend connected and verified on 16 October 2026. Real Google owner sign-in and Firestore draft storage work. Public deployment is pending.

## Created cloud resources

- Project: **EGAILE**, ID `egaile-c28ac`, number `631811194995`, Spark plan. No billing upgrade.
- Web app: **EGAILE Website**, app ID `1:631811194995:web:dd6f01ed1ffc242bd1aa06`.
- Authentication: **Google only**, public-facing name EGAILE. Email/password, anonymous and phone sign-in have not been enabled.
- Firestore: Standard `(default)` database, **asia-south1 (Mumbai)**. Console rules deny every client read and write. The explicitly approved owner membership and initial saved content draft are stored privately. No customer data was migrated from the local prototype.
- Analytics account: `412325973`, property: `559286990`, stream: `16144052641`, measurement ID: `G-8KTY62SH66`, website: `https://www.egaile.com`.
- Analytics business country **India**, all four optional account data-sharing choices disabled and verified after reload. Enhanced measurement is off; no visitor data has been received.
- `.env.local` now uses the Firebase backend and has local owner mode disabled. The earlier local-adapter settings are preserved in ignored `.env.local-adapter`. Public Firebase configuration is also in ignored `.env.firebase`; it is not a service-account credential.
- Local server authentication uses Google's Application Default Credentials in the normal Windows user credential store, outside Git. No service-account key was created. The official Google Cloud CLI 589.0.0 was downloaded into the workspace's `work/google-cloud` folder and its published SHA256 verified.
- Founder account `deepakchowdhry@gmail.com` has the active website owner role. Its real Google provider and verified email were checked after successful sign-in. This grants application staff access; no extra Google Cloud IAM role was added.
- Authorised local sign-in domains include `localhost` and `127.0.0.1`. Add the final public host before deployment.

## Public website and staff access

- Public pages and the contact journey do not require visitor accounts, including anonymous Firebase accounts.
- The footer's **Admin login** opens `/admin/login`. Protected operations require both verified Firebase identity and an active staff membership.
- Signing in to Google does not by itself grant administration rights. The founder's first owner membership must be explicitly bootstrapped.
- Do not enable a public registration flow or grant staff permissions to all authenticated users.

## Traffic reporting

Use the EGAILE Google Analytics property linked to the Firebase web app for visitor activity: users, sessions, page views, devices and engagement. Reporting does not require visitors to log in. Current measurement deliberately omits referrers and campaign query strings, so campaign/source attribution is limited.

Google Analytics automatically excludes known bots. Hosting request logs and monitoring are needed separately to inspect automated requests, errors and abuse; neither source guarantees perfect human/bot classification. Requests are not unique people. Consent choices, blockers and disabled JavaScript also affect Analytics counts.

The application now implements opt-in Analytics, a persistent preference/withdrawal control and 180-day preference expiry. It loads no Google measurement script until consent, only in production on the exact EGAILE public domains. Approved public page paths are measured; query strings, form contents and private routes are omitted. Local/staging hosts and private draft frames are excluded. Enhanced measurement is off in the console to avoid automatic forms/history events and duplicate page views. Browser consent/network and reporting verification remains a deployment task before `NEXT_PUBLIC_ANALYTICS_ENABLED=true`. The public privacy notice still needs the actual business and provider details before launch.

## Verified local connection

Real Google sign-in reached the protected workspace as the approved founder. Saving the initial draft created Firestore draft version 2 without publishing changes. A fresh signed-out request to `/` returned 200, the private content API returned 401 and `/admin` redirected to login. An identity without staff membership was denied. No Google account automatically becomes a website admin.

For another development computer, authorise Google's supported Application Default Credentials flow. For deployment, use a managed runtime identity instead of the founder's personal ADC. Never copy browser cookies, use a Firebase CLI token as a service credential, or commit a private service-account key. The bootstrap script can explicitly register an identity without a password using `--create-account`, then grants the first owner only if no active owner exists. Further roles go through the protected admin workspace.

Account country is not a guarantee that all Analytics processing stays in that country. Additional Data Processing Terms have not been accepted; review applicability before launch. Storage, App Hosting and background workers require a separate billing decision. Domain/DNS, deployment, media Storage, email delivery, App Check, deployed runtime identity and live Analytics are not completed. Public enquiry acceptance is not launch-ready. The website server remains local while drafts and staff membership now persist in Firestore.

Official references:
- https://firebase.google.com/docs/analytics/web/get-started
- https://support.google.com/analytics/answer/9888366
