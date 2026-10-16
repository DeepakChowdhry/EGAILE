# EGAILE implementation status

16 October 2026 | Source version 0.2.0

## Working build

The public website and protected admin workspace are implemented and running locally. The six consultancy services, SME/IT-company content, higher contrast, responsive hero, publishing workflow, content recovery, page templates, menus/SEO, validated image upload and private enquiry handling work in this build.

Firebase project `egaile-c28ac` is connected on Spark. Google is the only enabled sign-in provider. The Standard Firestore database is in `asia-south1` (Mumbai), with deny-all client rules verified in the console. Analytics property `559286990` and stream `16144052641` are linked, the domain is `https://www.egaile.com`, business country is India and all four optional account sharing choices are disabled. Enhanced measurement is off. The configured local application now uses the Firestore backend, Google's local ADC and the approved founder owner membership; local-owner shortcut mode is disabled. Deployment and live measurement remain pending.

## Verification completed

- Next.js 16.4.2 production build and TypeScript validation pass.
- Three new traffic-policy tests pass: production/domain gating, private-route exclusion and consent validation/expiry. No live visitor tracking test has been performed; tracking is deliberately disabled locally and pending launch.
- Real Firebase checks pass: verified Google founder identity, active owner role, successful admin sign-in, saved Firestore draft version 2, unknown staff denied, signed-out public page 200, private API 401 and admin login redirect. No public content was published during these checks. TypeScript validation also passes after the bootstrap update.
- Firebase delivery and recovery function bundle compiles.
- Fourteen tests pass against Google's local Auth and Firestore emulators, including concurrent edits, private drafts, restoration, redirect recovery, duplicate enquiry submission, atomic rollback, invalid data, rate limits, roles, notification retries/leases, production fallback denial, active membership, revoked sessions and direct database access denial.
- The standard local suite now passes fourteen tests and skips three emulator-only checks when emulators are absent.
- HTTP checks pass for public routes, 404 handling, unauthenticated private access, cross-origin mutation denial, draft isolation, stale edits, valid optimised image upload, invalid-file rejection, enquiry deduplication, state transitions and sign-out.
- Browser review confirms the local login, dashboard, saved draft, private preview, unchanged public content before publication and explicit publication with version verification. Desktop preview at 1440 CSS pixels and mobile preview at 390 pixels show no horizontal overflow.
- The production dependency audit reports zero advisories after pinning the patched gRPC transport dependency. This is not a claim that an audit proves the application free of defects.

No availability, traffic capacity, recovery-time or real cloud-delivery target is reported as achieved. Emulator tests do not replace deployment-specific validation.

## Before public launch

Prepare a separate staging environment, review Blaze billing and credits, authorise the server identity, connect the Firebase configuration, bootstrap the first owner, configure Storage/App Check/IAM/secrets and validate the hosting proxy's trusted IP header. Configure and deploy the email worker and recovery schedule, verify a real controlled delivery and complete the restore exercise. Validate consent and Analytics in the deployed environment before enabling measurement. Review any additional applicable Data Processing Terms separately; they have not been accepted by this implementation.

Backups, retention automation, monitoring alerts, MFA/owner account protection, actual quota/budget controls and real-load tests need configuration and verification in that project. Final public business/contact details and the privacy notice need approval. Public enquiry acceptance is blocked in production until the launch flag is explicitly enabled. Domain/DNS and billing have not been changed.

The initial content payload is bounded at 280 KB and 150 pages, with one public content snapshot and bounded revision records. Staff saves use a site-wide revision check. Enquiry lists/export cover the latest 100 displayed records. Extend these boundaries deliberately before a larger catalogue or historical export requirement; this version does not silently promise unlimited scale.

Payments, CRM, booking, client accounts/tenant isolation and arbitrary external-website requests remain later work behind the defined server interfaces. No live payment, real enquiry email or third-party business transaction has been performed by this build.

Clearly labelled synthetic enquiries and a small synthetic upload may remain in the local development data folder for review. They are excluded from Git and from the source download.
