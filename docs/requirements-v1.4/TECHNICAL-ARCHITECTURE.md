# EGAILE Website Technical Architecture

Version 1.0 | 16 October 2026 | Architecture baseline for package 1.4

## 1 Architecture decision and scope

Build EGAILE as a modular Next.js application with React and TypeScript, Firebase Authentication, Cloud Firestore and Cloud Storage for Firebase. Provide one custom admin experience for routine content and authorised enquiry work. Firebase App Hosting is the preferred hosting candidate because it supports Next.js and fits the founder's Google direction. Retain working Google AI Studio project components after inspection rather than rebuilding by default.

This architecture supports the consultancy website, nontechnical administration, additional staff and later integrations. It does not implement client consultancy delivery, payments or a customer portal at launch. The founder's acceptance of UI and UX establishes visual direction; production reliability must be demonstrated. Google AI Studio is a development tool, not the production database or an automatic production operations service.

This document supersedes the platform choices in version 1.3 TDD decisions TD02, TD03, TD06 and TD07, and replaces their CMS, SQL and identity implementation details with the Firebase design below. TD01 and the intent of TD04, TD05 and TD08 remain applicable. BRD, FRD and PRD business and functional requirements remain in force, including FN37 to FN40 and NFR10 to NFR11. Earlier SQL constraints, Supabase policies and Sanity workflows are historical alternatives, not parallel launch dependencies. There is no requirement to run both databases or two CMS products.

## 2 Technology register

| Layer | Proposed technology | Responsibility |
|---|---|---|
| Public and admin interface | React with Next.js App Router and TypeScript | Responsive website and /admin application |
| Presentation | Tailwind CSS and central design tokens | Reusable page blocks, stronger contrast, responsive styles and accessible focus states |
| Hero motion | CSS and selective Canvas where justified | Lightweight animation with still state, pause and reduced-motion behaviour |
| Backend | Next.js Route Handlers and server-side services on Node.js | Validation, permissions, content publishing, enquiries and integration endpoints |
| Identity | Firebase Authentication and Firebase Admin SDK on the server | Sign-in, secure session verification and account recovery |
| Operational and content data | Cloud Firestore Standard edition using the document model | Content revisions, memberships, enquiries, outbox and audit records |
| Media | Cloud Storage for Firebase | Authorised uploads and optimised public images; separate restricted backup storage |
| Background processing | Cloud Functions for Firebase using Node.js and TypeScript; scheduled recovery sweep | Durable-task processing, bounded retries and stalled-task recovery |
| Abuse protection | Firebase App Check where supported, plus server validation and rate controls | Reduce automated misuse; does not replace authorisation |
| Hosting and delivery | Firebase App Hosting candidate with CDN and managed runtime | Next.js delivery, custom domain and server endpoints |
| Secrets and access | Google Cloud IAM, managed runtime identity and Secret Manager | Narrow service permissions and server-only provider credentials |
| Operations | Cloud Logging and Cloud Monitoring with configured alerts | Detect application errors, failed jobs, latency and resource pressure |
| Development and quality | GitHub, GitHub Actions, Firebase Emulator Suite, Vitest and Playwright | Source history, repeatable checks, permission tests and browser journeys |

Pin supported stable versions at implementation. No .NET service, PostgreSQL database, separate Sanity account or runtime AI API is required for this baseline. An ASP.NET Core service or relational store can be evaluated later for a specific need behind a defined API boundary.

Firebase App Hosting supports Next.js and GitHub integration. Its documented production runtime and billing requirements must be verified against the existing project before deployment. References S1 and S2.

## 3 Application boundaries and project ownership

Start with one maintainable application and separate modules for content, identity and permissions, enquiries, media, publishing, integrations and operations. Background workers execute outside the web request lifetime. Avoid microservices until a module needs independent scaling, release ownership or a stronger security boundary.

Create a separate EGAILE production Firebase project. Do not share Knovexa users, data, credentials or permissions. Use a separate staging project and local emulators for development. Each environment has its own configuration, service identities, secrets and test destinations. The founder owns the Google project, billing account, domain and GitHub repository; technical access is named and revocable.

Visitors receive published pages and submit bounded enquiries over HTTPS. They cannot query private lead collections or access drafts. Staff use /admin/login and one protected /admin session. A future client portal requires separate data ownership and tenant-isolation requirements; adding staff accounts does not automatically provide customer multi-tenancy.

The server checks each permitted action before accessing Firestore or Storage. Browser clients do not directly query these data stores in the baseline, except a separately authorised short-lived upload mechanism if selected. Default client rules deny database access. Server SDKs bypass Firestore Security Rules, so server authorisation and IAM are mandatory boundaries. Restrict the runtime service identity and test unauthorised API calls; hiding menu items is insufficient. Reference S3.

## 4 One admin session and multiple users

Use Firebase Authentication for approved sign-in methods, initially email/password and optionally Google sign-in for invited staff. Multiple sign-in methods are different from multi-factor authentication; select supported owner protection separately and verify plan eligibility. Public self-registration does not grant staff membership.

After sign-in, exchange a freshly verified ID token through a CSRF-protected session endpoint for a secure HTTP-only cookie. Use an eight-hour maximum admin session as an initial policy proposal. Each protected request verifies the session, appropriate revocation state and active membership, then checks the requested action. Firebase session cookies are verified by the server; they are not passed to Firestore as browser access credentials. Sign-out clears the cookie; owner revocation disables membership and revokes the appropriate tokens. Reference S4.

| Role | Permitted routine work | Restricted work |
|---|---|---|
| Owner | Membership, approved settings, publishing and permitted enquiries | Infrastructure or billing changes follow explicit owner action outside routine content editing |
| Editor | Draft content, supported templates, media and preview | Cannot publish, read leads, change roles or edit integration secrets |
| Publisher | Review and publish approved content, restore revisions | Cannot manage staff or private leads unless separately granted |
| Enquiry operator | Read assigned or permitted leads, record follow-up and approved export | Cannot edit public content, grant roles or change payment state |

The founder may hold several roles initially. Membership lives in a trusted server-managed record keyed by Firebase UID. An authenticated user without membership receives no admin access. Enforce changes promptly rather than relying only on old token claims. Record actor, action, record reference and time for sensitive changes without duplicating enquiry messages in logs.

Before the anticipated six-month expansion, confirm staff counts and workflows. Invite named users, test permissions and recovery, document account removal and repeat concurrency tests. No shared founder password is needed.

## 5 Firestore data design and content management

Firestore is a document database. It replaces the earlier SQL model rather than hosting PostgreSQL under another name. Use application schemas, validation, indexes and transactional checks to preserve business rules. References S5 and S6.

| Collection | Principal records | Access and consistency |
|---|---|---|
| contentDrafts | Service, industry, article and standard-page records with ordered blocks | Staff only; expected revision required for updates |
| contentRevisions | Immutable versions with actor, time and media references | Staff recovery; private draft text never returned publicly |
| publishedContent | Validated public snapshots or pointers to approved revisions | Server delivers approved fields only; no private evidence or drafts |
| siteSettings and navigation | Contact details, menus, SEO defaults and appearance presets | Validated editable configuration; separate draft and published versions |
| slugReservations | Canonical path ownership and redirects | Transaction prevents duplicate paths and redirect loops |
| memberships | UID, roles, active state and access scope | Owner-managed through authorised server actions |
| enquiries | Opaque receipt, bounded form fields, selected-service snapshots and follow-up state | Private; ID is not permission; no public lookup endpoint |
| submissionKeys and deliveryTasks | Payload hash, receipt mapping, task state, attempts, lease and next attempt | Server only; deterministic keys prevent duplicate acceptance |
| auditEvents and webhookEvents | Safe action metadata and unique provider-event processing state | Restricted access and approved retention |

Use random record IDs where appropriate, server timestamps and versioned schemas. Store stable service/industry IDs and their approved labels at enquiry time so renaming a service preserves historical context. Not sure and Other are deliberate values; unknown IDs fail validation. Do not store an ever-growing array of all enquiries or revisions in one document.

Plan queries and composite indexes for status, owner and date. Use cursor pagination and bounded result sizes. Avoid full-collection listeners, repeated public database reads and a shared counter document that every request updates. Record retention, index configuration and schema migrations in Git. Deletion includes related records and backup expiry under the approved policy.

The custom admin application is the content management system. It must implement the approved page templates, image/alt-text management, menus, metadata, appearance presets, preview and recovery; Firestore does not supply that editor automatically. Ordinary edits do not require a GitHub commit, an AI Studio prompt or a software deployment.

## 6 Concurrent editing and publication

Every draft carries a revision identifier. A save submits its expected revision; a transaction updates only if it still matches. A stale tab receives a conflict explanation and reload/compare choices instead of silently overwriting another person's work. Keep transactions short and free of email or external API side effects because transaction callbacks can retry. Reference S6.

Use the workflow Save draft, Preview, Validate, Publish and Verify live. Publication validates fields, routes, content references, appearance rules and publication permission, then atomically records the approved revision and public snapshot/pointer. A versioned revalidation task refreshes affected Next.js pages and verifies the live version. Saving and publishing are distinct; successful storage is not proof that visitors can see the change.

For menus and related records, publish a consistent bounded set or reference already published records. Prevent public links to drafts. Cache only public approved data. Keep the last valid public representation where the hosting cache supports it, and show a retryable failure if a cold request cannot load required data. Do not promise that caching keeps every route available during a total provider outage.

Restoring a revision creates a new draft that can be previewed and explicitly republished. Keep old revisions subject to retention. Software rollback and content restoration are separate procedures. Strong contrast and reduced-motion controls apply to both public and admin screens.

## 7 Reliable enquiries and asynchronous work

The public enquiry endpoint validates the bounded payload, published choice identifiers, origin, abuse signals and rate limits. Private enquiry messages never enter a URL, public cache, analytics event or persistent browser storage. On transient failure, keep current form values in memory and offer retry or the approved direct-contact route.

For a new submission, a Firestore transaction creates the enquiry, idempotency mapping and notification task together. The same key and canonical payload return the original receipt; a changed payload with a reused key is rejected. Only a successful durable commit produces a received response. Database unavailability produces an honest failure rather than a success animation. Reference S6.

A deployed background worker claims a task using a lease, calls the email adapter with a timeout, and records delivered, retry-pending or failed status. Expect duplicate event delivery; use deterministic task IDs, provider idempotency where available and safe state transitions. A scheduled sweep recovers expired leases and tasks whose trigger did not complete. Configure bounded attempts and an operator-visible failure state; do not retry permanent errors indefinitely. References S7 and S8.

No unawaited work after the API response is treated as a queue. A provider outage leaves the lead available in the admin dashboard. Exactly-once external email delivery is not promised. Business follow-up remains assigned to a named person, including when email notifications fail.

## 8 Media security and future integrations

Uploads require a permitted role, safe file type/signature, bounded size and alt text or decorative status. The initial proposed maximum original image is 10 MB, subject to implementation verification. Do not accept arbitrary executable content. Replacements retain a media reference manifest and warn about shared use. Only approved website assets become public; backup objects remain restricted. A preview generated in browser memory is not a completed upload.

Expose provider-neutral interfaces for notifications, payments, booking, CRM and selected external data sources. Each adapter defines an owner, versioned request/response shape, allowed fields, timeout, retries, deduplication, quota, secret location and off switch. Optional integrations must not be dependencies for public-page rendering or durable enquiry acceptance.

Payment is a later module. Choose a provider after confirming the legal entity, countries, currencies and transaction model. Use provider-hosted checkout or approved tokenised components; never collect raw card data in EGAILE's database. The server sets order amount and currency. Verify webhook signatures using the original body, enforce provider replay rules, deduplicate events and transactionally apply permitted order-state transitions. Browser redirects do not establish paid status. Refunds, reconciliation, access provisioning and partial failures need their own acceptance tests before activation.

External website access must use an authorised API or a separately approved data-access method. Allowlist hosts and destinations, protect against server-side request forgery, minimise transferred data and handle credentials/OAuth on the server. A configurable URL field is not permission to fetch arbitrary internal or third-party resources. New providers need implementation work; the founder can change only supported safe configuration.

## 9 Reliability objectives and scaling plan

The following are proposed engineering targets, not measured results or a purchased service-level agreement. Confirm them against real traffic, staffing, geography and budget before launch.

| Area | Proposed target | Evidence required |
|---|---|---|
| Availability | 99.9 percent monthly for the public enquiry journey | Synthetic monitoring plus actual request outcomes; do not exclude provider failures silently |
| Content propagation | Within two minutes under healthy services | Version observed through a fresh public request; failed propagation visible |
| Initial capacity exercise | 100 concurrent public browsing sessions, 10 simultaneous staff sessions and a burst of 10 distinct enquiries | Staging workload with representative content, quotas and mixed edit/read activity; not a claim of tested capacity |
| Backend latency | Enquiry acceptance p95 below 1.5 seconds under the agreed test load | Database commit included; outbound email excluded from synchronous path |
| Data recovery | RPO at most 24 hours and RTO at most 8 hours for database disaster recovery | Timed restore exercise with named operator; smaller loss window requires a costed alternative |
| Failure detection | Critical synthetic check failure detected within five minutes | Working alert destination and named responder; acknowledgement coverage agreed separately |

RPO is the maximum intended loss window; RTO is the intended time to restore service. A daily backup can still lose up to a day of new enquiries after a disaster. If that loss is unacceptable, evaluate more frequent recovery or point-in-time recovery before accepting real leads. Near-zero loss is not implied by the word reliable.

Scale through cached public content, indexed bounded queries, stateless request handling and independently processed tasks. Set runtime instance/concurrency limits and review observed latency, errors, database operations, storage and cost. Limits that protect budget can also constrain capacity; validate both. Reassess at 70 percent of an agreed quota/budget or sustained latency/error degradation, and before adding staff or customer-facing features. Six months is a review milestone, not an automatic architectural failure date.

## 10 Backups monitoring and issue resolution

Configure daily managed Firestore backups with an approved retention schedule, plus protected independent exports and a media manifest. Evaluate point-in-time recovery against the RPO. Backup/restore features and storage incur separate costs; project replication alone does not undo accidental deletion. Store recovery copies with narrow access and documented expiry. Test restoring into an isolated environment before launch, monthly thereafter and after material schema or access changes. References S9 and S10.

Back up Firestore, media originals and references, required identity configuration/recovery arrangements, indexes/rules, deployment configuration and source. Do not assume a Firestore backup includes Firebase Authentication users, provider settings or Storage assets. Document a supported identity export/recovery procedure separately, protect its secrets and verify sign-in after recovery. Never restore test users or send test notifications into production by accident.

Log correlation ID, route, result, duration and redacted provider error codes. Exclude passwords, tokens, card data, enquiry messages and raw request bodies. Monitor failed submissions, task age, retry exhaustion, publication failures, authentication errors, latency, quota usage and backup age. The admin dashboard shows safe operating summaries and useful next steps; infrastructure diagnostics remain permission-restricted.

The operating guide must cover checking live status, locating a receipt or correlation ID, reviewing failed tasks, retrying safely, restoring content, reverting a release, restoring data, revoking access and escalating a provider outage. Name an owner and backup responder. Retain a change history and reproducible incident evidence without copying personal data into support conversations.

When the founder returns for help, a technical assistant or maintainer can work from the repository, redacted diagnostics and authorised access. This is not automatic monitoring, guaranteed immediate response or a support contract. Continuous coverage must be assigned and configured. Public-page, enquiry and admin recovery actions should be documented so routine incidents do not depend on one conversation.

## 11 Delivery controls and cost decisions

Inspect the existing AI Studio project, its framework, Firebase project links and exportability. Keep compatible working code; record any migration. Use GitHub with dependency lockfiles, environment templates without secrets, migrations, indexes, rules, tests and setup/runbook documentation. GitHub Actions validates builds, business rules and relevant browser/permission journeys. Deploy to staging first; production releases are deliberate and have a rollback reference. Rehearse backup and rollback before domain launch.

Firebase App Hosting and Cloud Storage for Firebase require Blaze billing. Free allowances may offset some usage but do not establish unlimited or permanently free service. Cloud Functions, scheduled work, backup/recovery, monitoring retention, media and email may add cost. A static Firebase Hosting-only alternative would require separately hosted APIs and workers and must be evaluated as a different deployment design. References S2 and S11.

Google AI Pro currently lists US$10 monthly Google Cloud credits through its developer benefits. Confirm activation, applicable billing account, eligibility, covered services and expiry in the founder's account. Knovexa's reported zero bill is useful context, not a verified forecast for EGAILE. Review cost after credits expire and before increased use. Budget alerts notify; they are not a universal hard spending cap. No billing upgrade, provider purchase or resource deployment is performed by this document. Reference S12.

Before implementation, confirm project ownership, allowed sign-in methods, staff roles, data/storage regions, content catalogue, email provider, named enquiry owner, operating budget, retention and recovery targets. International visitors do not imply automatic legal compliance or unrestricted data transfer. Choose regions and notices to match the actual business and processing arrangements.

## 12 Verification and requirement mapping

TA01 selects the Firebase stack and maps to TD01, revised TD02/TD03/TD06/TD07 and BR04/BR06/BR07. TA02 covers shared admin identity and roles and maps to FN07, FN23/FN24, FN37 and NFR05/NFR10. TA03 covers structured content and publication and maps to FN08 to FN17, FN38 to FN40 and NFR02/NFR06/NFR09/NFR11. TA04 covers durable acceptance and workers and maps to FN18 to FN25 and NFR04. TA05 covers extensible adapters and maps to FN27 to FN30 and BR04. TA06 covers recovery, monitoring and ownership and maps to FN25/FN26, BR07/BR09 and NFR07/NFR08.

The release evidence must include permission-denial tests, revoked/expired sessions, concurrent edits, draft isolation, actual media upload, slug collisions, draft-to-live publication, revalidation failure, content restore, concurrent duplicate submissions, database failure, email outage, duplicate worker execution, expired-lease recovery, safe exports, a timed data restore and the capacity exercise. Use emulators for repeatable rules/business tests and staging for real provider behaviour; emulators do not establish production performance. Payment and external-provider tests apply when those modules are separately authorised.

The founder demonstrates independent editing and enquiry handling after training. Record each target and requirement as passed, failed or deferred with an explicit decision. Screenshots, automatic scaling features and vendor marketing do not substitute for this evidence.

## 13 Official references checked on 16 October 2026

- S1 Firebase App Hosting and Next.js support https://firebase.google.com/docs/app-hosting
- S2 App Hosting billing and costs https://firebase.google.com/docs/app-hosting/costs
- S3 Firestore server access and Security Rules boundary https://firebase.google.com/docs/firestore/security/rules-conditions
- S4 Firebase server session cookies https://firebase.google.com/docs/auth/admin/manage-cookies
- S5 Firestore document model https://firebase.google.com/docs/firestore/data-model
- S6 Firestore transactions https://firebase.google.com/docs/firestore/manage-data/transactions
- S7 Asynchronous retry behaviour https://firebase.google.com/docs/functions/retries
- S8 Firebase pricing and service eligibility https://firebase.google.com/pricing
- S9 Firestore disaster recovery https://firebase.google.com/docs/firestore/disaster-recovery
- S10 Firestore backup and usage billing https://firebase.google.com/docs/firestore/pricing
- S11 Storage billing requirements https://firebase.google.com/docs/storage/faq-and-troubleshooting
- S12 Google AI Pro developer benefits https://support.google.com/googleone/answer/14534406?hl=en

These references support provider capabilities and billing facts. Module boundaries, roles, capacity assumptions, recovery objectives and acceptance tests above are EGAILE design proposals that require implementation and verification.
