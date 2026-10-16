# EGAILE implementation status

16 October 2026 | Source version 0.2.0

## Working build

The public website and protected admin workspace are implemented and running locally. The six consultancy services, SME/IT-company content, higher contrast, responsive hero, publishing workflow, content recovery, page templates, menus/SEO, validated image upload and private enquiry handling work in this build.

Firebase adapters, individual accounts, membership roles, server session verification, deny-by-default client rules, delivery workers and deployment templates are supplied. Firebase cloud services are not connected: the founder confirmed that a separate EGAILE project has not yet been created. Local operation uses a private SQLite document adapter, with an explicit development-only owner shortcut and no shared production password.

## Verification completed

- Next.js 16.4.2 production build and TypeScript validation pass.
- Firebase delivery and recovery function bundle compiles.
- Fourteen tests pass against Google's local Auth and Firestore emulators, including concurrent edits, private drafts, restoration, redirect recovery, duplicate enquiry submission, atomic rollback, invalid data, rate limits, roles, notification retries/leases, production fallback denial, active membership, revoked sessions and direct database access denial.
- The standard local suite passes eleven tests and skips three emulator-only checks when emulators are absent.
- HTTP checks pass for public routes, 404 handling, unauthenticated private access, cross-origin mutation denial, draft isolation, stale edits, valid optimised image upload, invalid-file rejection, enquiry deduplication, state transitions and sign-out.
- Browser review confirms the local login, dashboard, saved draft, private preview, unchanged public content before publication and explicit publication with version verification. Desktop preview at 1440 CSS pixels and mobile preview at 390 pixels show no horizontal overflow.
- The production dependency audit reports zero advisories after pinning the patched gRPC transport dependency. This is not a claim that an audit proves the application free of defects.

No availability, traffic capacity, recovery-time or real cloud-delivery target is reported as achieved. Emulator tests do not replace deployment-specific validation.

## Before public launch

Create separate EGAILE staging/production Firebase projects, confirm regions and ownership, review Blaze billing and credits, configure Firebase Auth, bootstrap the first owner, configure Storage/App Check/IAM/secrets and validate the hosting proxy's trusted IP header. Configure and deploy the email worker and recovery schedule, verify a real controlled delivery and complete the restore exercise.

Backups, retention automation, monitoring alerts, MFA/owner account protection, actual quota/budget controls and real-load tests need configuration and verification in that project. Final public business/contact details and the privacy notice need approval. Public enquiry acceptance is blocked in production until the launch flag is explicitly enabled. Domain/DNS and billing have not been changed.

The initial content payload is bounded at 280 KB and 150 pages, with one public content snapshot and bounded revision records. Staff saves use a site-wide revision check. Enquiry lists/export cover the latest 100 displayed records. Extend these boundaries deliberately before a larger catalogue or historical export requirement; this version does not silently promise unlimited scale.

Payments, CRM, booking, client accounts/tenant isolation and arbitrary external-website requests remain later work behind the defined server interfaces. No live payment, real enquiry email or third-party business transaction has been performed by this build.

Clearly labelled synthetic enquiries and a small synthetic upload may remain in the local development data folder for review. They are excluded from Git and from the source download.
