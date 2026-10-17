# EGAILE website Technical Design Document

Version 1.3 | 16 October 2026 | Status proposed architecture

## 1 Purpose and design conclusion

The website needs two things at the same time: founder-operated editing and a technical foundation that can accept future integrations. The recommended custom approach is a Next.js website, a unified protected admin application backed by a configured CMS, with Sanity as a candidate and a separate PostgreSQL operational database. This is a recommendation for review, not a deployed system or a fixed vendor commitment.

CMS means content management system. The founder uses it to manage public website information. PostgreSQL stores private operational records such as enquiries. The two stores serve different purposes; private leads must never be put into a public content collection.

The technical design must satisfy BRD.md, FRD.md and PRD.md, including the founder's clarified cross-industry SME IT-consultancy positioning. It supersedes the earlier Git-only editorial model. Application development remains on hold while the requirements and choices are reviewed.

### Business scope and website technology

EGAILE's consulting services may recommend AI-assisted coding, workflow automation and different tools for different clients. Those client solutions are separate from the technology used to run EGAILE's own website. The website does not require a visitor-facing AI assistant, online process-analysis engine or runtime Gemini API merely because AI is part of the consultancy offer.

Service and industry content must remain configurable in the CMS rather than being coded around manufacturing. Enquiry choices must accommodate IT services and other SME sectors. Adding a new sector or consulting service using existing content types should be an editorial task, not a database migration.

The founder has existing work in Google AI Studio. Treat it as a candidate development environment and inspect that project's actual framework, dependencies, data connections and exportability before finalising the stack. The recommendations below are not a direction to replace existing work automatically. No code change is authorised by this document revision.

## 2 Platform approach and alternatives

| Approach | Founder control | Integration and operating implications |
|---|---|---|
| Next.js with configured Sanity CMS and PostgreSQL | Structured content, templates, visual preview and rearrangement of implemented sections | Strong custom application flexibility; initial development/configuration required; multiple services to operate |
| WordPress with a block theme and managed hosting | Broader visual page/template editing through its editor | Suitable alternative when visual freedom leads; plugins, updates, backups, hosting and security still need ownership |
| Custom site with content only in Git | Routine changes require a technical workflow | Does not satisfy the founder-independence requirement and is not recommended as the launch model |

The recommendation favours the custom approach because the stated direction includes future APIs and a distinct EGAILE experience. WordPress remains a valid choice if the founder wants more open-ended visual editing. Its Site Editor supports pages, patterns, templates and global styles; this is not a claim that every plugin or hosting plan is free. See the official [Site Editor](https://wordpress.org/documentation/article/site-editor/) and [styles](https://wordpress.org/documentation/article/styles-overview/) guidance.

Sanity's structured page-building and visual-editing features require schemas and frontend components to be configured; selecting the product alone does not create EGAILE's editor. See [page-building guidance](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building) and [visual editing setup](https://www.sanity.io/docs/visual-editing/enabling-drag-and-drop).

## 3 Proposed technology register

| ID | Layer | Recommendation | Requirement and flexibility |
|---|---|---|---|
| TD01 | Public application | Next.js App Router, React and TypeScript | Reusable public templates and server API; keep business modules distinct |
| TD02 | Content and editing | Unified admin editing UI over a configured CMS backend; Sanity is a candidate | FN07 to FN17 and FN37 to FN40; validate identity and editorial APIs; replace through content contracts and migration mapping |
| TD03 | Operational data | PostgreSQL, initially evaluate Supabase hosting | Enquiries, users/roles, delivery tasks and audit records; SQL exportability |
| TD04 | Notification delivery | Provider-neutral email adapter and durable task processing | FN20 to FN22; replace provider without changing form or enquiry rules |
| TD05 | Future third parties | Separate CRM, booking, newsletter and analytics adapters | FN27 to FN30; no vendor SDK dependency inside page templates |
| TD06 | Admin identity and access | One protected admin session; Supabase Auth candidate with trusted roles and server-side authorisation | FN07 FN23 FN24 FN37; content and lead routes share verified identity while enforcing separate permissions |
| TD07 | Hosting and domain | Netlify candidate; Vercel paid alternative; existing registrar | Modern Next.js runtime support, custom domain, usage review and migration path |
| TD08 | Ownership and release | Founder-controlled GitHub, content exports, operational backups and documented releases | Separate content publishing from software deployment and make replacement practical |

Styling proposal: Tailwind CSS with central design tokens and reusable accessible components. Use supported stable versions and a lockfile when implementation begins; do not commit to an unverified newest version in this planning document. Font selection and media licensing remain design decisions.

## 4 System boundaries

| Boundary | Responsibility | Information permitted |
|---|---|---|
| Visitor browser | Read pages, navigate and submit context | Published content and the visitor's current form values |
| CDN and public application | Deliver approved pages and assets | Published public content; no private lead cache |
| CMS dashboard | Author, preview, publish and recover content | Intended public business information and public media only |
| Enquiry API | Validate, limit abuse and save a request | Bounded visitor enquiry and versioned acknowledgement |
| Operational database | Durable private records and workflow state | Leads, trusted roles, delivery tasks, audit and short-lived rate buckets |
| Lead console | Authorised enquiry follow-up and export | Records permitted for the logged-in operator |
| Delivery worker | Retry and track outbound notification tasks | Minimum approved fields needed by the chosen destination |
| Third-party adapters | Translate EGAILE's contracts into provider calls | Approved mappings, scopes and secrets held server-side |

Public content is delivered independently from lead processing. An optional CRM or email outage must not remove public pages or destroy accepted enquiries. A database outage prevents honest acceptance of a new enquiry and must be shown as a retryable failure.

Use one maintainable application with separate modules initially. Do not start with microservices or a cluster solely to appear scalable. Extract workers or portal functions only when independent workload, ownership or security needs justify it.

## 5 Founder editability matrix

| Change | Founder without coding after setup | Technical help required |
|---|---|---|
| Text, images, button labels and links | Yes through validated CMS fields | New unsupported content type |
| New service, industry, article or standard page | Yes using existing templates | New template behaviour |
| Section order and visibility | Yes for supported blocks | A fundamentally new block or interaction |
| Header/footer/menu and contact details | Yes through global settings | New navigation mechanics or schema |
| SEO title, description and social image | Yes with validation | New search integration or routing system |
| Colours, typography and spacing | Select implemented presets within contrast/layout rules | New font assets, unrestricted styles or design-system changes |
| Hero | Change content/media, choose supported variant, enable/disable motion | New animation algorithm, new 3D scene or custom interaction |
| Booking or social links | Change allowed destinations | Implement a new booking API, webhook or OAuth flow |
| Enquiry handling | Review, assign supported state and export permitted records | Add fields, change validation or permissions |
| Providers and infrastructure | Review usage, revoke accounts and use documented owner settings | Migrate provider, alter database schema, rotate application secrets or modify deployment architecture |

The system should not expose arbitrary script entry or server secrets as a way to promise flexibility. The founder's interface exposes safe choices; the underlying system remains extensible through controlled technical changes.

## 6 CMS content design

Content entities are Site Settings, Navigation, Standard Page, Service, Industry, Process Area, Engagement Stage, Use Case, Article, Person/Author, Media Reference and Redirect. Each needs a stable internal identifier, relevant required fields and a publication state. Public pages use slugs, references and an ordered section list.

Initial section types are Hero, Rich Text, Image/Text Split, Service/Industry List, Method Stages, Article List, FAQ and Call to Action. Every type specifies its permitted fields, mobile layout, accessibility rules and allowable variants. Reordering supported sections changes content, not application source code.

Global settings include public contact details, footer, approved social links, hero defaults, design presets and search defaults. Menus refer to content records where possible, so a title change does not break a hardcoded path. Redirect records are validated against reserved paths, duplicate destinations, loops and unsafe external destinations.

Only content intended for publication belongs in the public CMS. Confidential sales files, contracts, leads, private biographies and credentials belong elsewhere. Sanity's current Free plan has public datasets and limited permission roles; do not assume private storage, enforced editor/publisher separation or long-term revision recovery from that plan. Check the current [pricing and feature matrix](https://www.sanity.io/pricing) before account selection. The recommendation may need a paid plan or another CMS if those controls are required.

### Consultancy content model

| Entity | Business fields and relationships | Editorial rules |
|---|---|---|
| Service | Stable ID, editable title/slug, summary, audience, process symptoms, assessment, intervention, deliverables, dependencies, proposed measures, related industries/use cases, CTA | SVC01 to SVC06 are initial proposed identifiers; a renamed title does not change the identity; retirement does not erase historical enquiry context |
| Industry | Stable ID, title/slug, description, sector process examples and references to services | Many-to-many relation to services; do not duplicate entire service pages for each sector |
| Process Area | Stable ID and editable label for broad work categories | Optional enquiry context; not a statutory industry or SME classification |
| Engagement Stage | Stable ID, label, explanation, sequence and outcome/deliverable | Reorder or edit supported stages in CMS without changing application logic; do not encode billing/contract decisions in this public narrative |
| Use Case | Problem, intervention, proposed measure, related service/industry, illustration or verified-result classification | Illustrations must be labelled; verified results require an approved evidence reference and permission status |
| Page Sections | Ordered references to supported block types and their fields | Permit client problem, deliverables, engagement stages, use-case previews and relevant CTA using reusable blocks |

Keep evidence documents and client permissions in a private controlled store. The public CMS stores only approved public claims and a non-sensitive approval marker, not contracts, client source code or confidential proof. A public record cannot be labelled as a verified client result unless the required evidence/permission check has been completed.

Founder configuration supports service names, descriptions, relations, use-case wording, stage sequence and existing appearance presets. Adding a new industry or a service within these schemas is an editorial operation. Adding an automated assessment or changing a schema/security rule is a technical release.

### Canonical content contract

The application reads services and industries through a provider-neutral content interface using stable identifiers, not vendor SDK objects in page components. Resolve the identifiers to current display titles and routes at the content boundary. Validate published content against required fields and strip draft/private fields before rendering. Keep the FRD field rules as the operational API contract; arbitrary CMS field creation must not automatically expand data collection.

## 7 Preview publication and content recovery

Draft preview uses an authenticated, time-limited server-mediated session. Draft-reading credentials never reach a public bundle. Preview is excluded from public indexing and cannot be used as a public read API for unpublished records. Test permissions independently of hiding an edit button.

Publication flow is save draft, preview, validate, explicitly publish, invalidate the relevant public cache and verify the live version. A signed CMS notification requests cache revalidation. Validate signature, freshness, permitted event and document reference, then deduplicate. A failed notification is logged safely and can be retried by an authorised operator.

Use incremental rendering/cache revalidation so routine founder edits do not require Git changes or a full production deployment. Sanity publication and website refresh remain separate observable steps. Cache only validated published content. If the CMS becomes unavailable, retain the last valid published result where the hosting/runtime supports it.

Do not rely on limited vendor history as the only recovery mechanism. Maintain an independently retrievable last-approved content snapshot containing references, order and asset identifiers. Owner recovery should restore that content through the CMS, then revalidate the website. Snapshot storage, access and retention must be chosen before launch. Larger changes need a full export as well. Source-code rollback is a separate operation.

## 8 Operational data model

| Record | Principal information | Constraints |
|---|---|---|
| Enquiry | UUID, opaque receipt, contact fields, company, message, service ID and label snapshot, optional industry/process-area IDs and label snapshots, country, source path, status, timestamps, notice version and expiry | Bounded fields; private; status rule; email is not globally unique |
| Submission key | Key, canonical payload hash, enquiry reference, expiry | Unique key; same payload returns same receipt; changed payload conflicts |
| Delivery task | Enquiry reference, destination, event version, state, attempts, next attempt, lease, safe error code and provider reference | Unique logical event/destination; durable retries |
| Operator membership | Authenticated user reference, trusted role, enabled state and timestamps | Managed by owner; never trusted from user-editable profile metadata |
| Enquiry audit | Actor, action, enquiry reference, prior/new status and timestamp | No duplicate private message text in audit metadata |
| Rate bucket | HMAC client bucket, window/count and expiry | Shared atomic limit, short retention and no raw IP |

Define versioned SQL migrations, explicit constraints, indexes on status/date and due-task fields, and serverless-safe connection pooling. Public browsers do not query lead tables. Use row-level security and scoped permissions with denial tests. Do not expose a platform service-role key to the browser or use broad admin access for normal lead management.

Proposed retention for review: unqualified leads 180 days, completed delivery/audit metadata 90 days, idempotency keys and rate buckets 24 hours or less. Qualified-client records require a separate agreed policy. Deletion covers downstream providers and expiring backups. These are design proposals, not published legal policy.

### Content references and historical enquiry context

CMS records and SQL records belong to separate services; there is no cross-system SQL foreign key. Store the selected stable content identifier and an approved label snapshot at enquiry acceptance. Keep the snapshot when a service is renamed or retired, so the operator can understand the original request. Source the snapshot from validated server-side reference data, not a visitor-supplied display label.

Use a last-known-approved reference catalogue for allowed service, industry and process-area values, refreshed through the content publishing flow. A CMS outage must not require every enquiry to fail if this approved catalogue remains available. If a selection is no longer recognised, return a field-level correction and allow the visitor to choose Not sure; preserve the rest of the form. Do not silently map a retired service to an unrelated offer.

Other and Not sure are supported sentinel choices distinct from a deleted or invalid identifier. Do not add a turnover field, manufacturing-specific columns or automatic SME eligibility rules. Optional industry/process classification must not become a hidden condition for receipt.

## 9 Enquiry API and delivery design

The public endpoint is POST /api/v1/enquiries over HTTPS, with a proposed maximum JSON body of 16 KB. Field rules come from FRD.md. Check content type, request size, exact allowed origin, honeypot, shared rate limit and schema before storage. Origin checks are an abuse control, not visitor authentication.

The client generates one submission key for the same payload and retries. A transaction stores the enquiry, its key and the initial notification task together. Only a successful commit returns a received response with an opaque reference. Same key/same payload returns the original receipt; same key/changed payload returns conflict. Invalid requests return field errors; rate limiting returns a retry indication; database uncertainty returns a temporary failure.

There is no public enquiry-list or lookup-by-email endpoint. Receipt identifiers are not authorisation to read a record. Do not return raw private message content or stack traces in error responses.

An authenticated dispatcher claims due tasks with row locking and a lease, calls the email adapter with a timeout, records provider acceptance and retries transient failures with bounded backoff. Expired leases can be reclaimed. An operator can inspect and redrive failed tasks. Delivery is at least once; provider-side deduplication is used where available, and exactly-once email is not promised.

Job cadence and supported host mechanism must be verified before launch. Unawaited work after a serverless response is not a reliable queue. A paused database or exhausted host quota requires honest failure handling and the approved direct-contact alternative; it does not justify a false success state.

## 10 Protected lead management

Provide a small protected browser console or configure a tool meeting FN23 to FN26. It must let an operator filter requests, read details, change approved states and export permitted fields. Normal sales work must not require editing infrastructure tables directly.

The candidate identity service is Supabase Auth, with server-verified sessions and trusted memberships. Authorise each read, update, export and deletion independently. Protect session operations against cross-site requests, require appropriate owner/MFA controls supported by the selected service, and audit sensitive actions. An operator cannot promote their own role. Database policies provide an additional boundary; a hidden button is not access control.

The founder controls invitations and revocation. Test expired/revoked sessions and negative-access scenarios before acceptance. Routine content and lead management must share one implemented admin sign-in. A separate CMS login for these tasks does not meet FN37. Verify the selected identity, CMS access and permission model in an implementation proof before final selection; do not assume a free plan supplies federation or single sign-on.

### Consultancy follow up boundary

The lead console displays the selected service, industry and process area alongside the original business problem. Authorised exports and optional CRM mappings include these fields only when the business has approved that purpose. No private enquiry text or selection identifiers are sent to visitor analytics.

Discovery scheduling, qualification and proposal scoping are human-operated at launch. Assessment workbooks, client repositories, business-system credentials and detailed process datasets are not collected by the public enquiry form. Future client-engagement tools need a separate authenticated boundary, data model and consent/access review.

## 11 Third party integration strategy

Each integration has an explicit purpose, selected provider, accountable owner, field mapping, minimum scopes, error/retry policy, cost limit, deletion route and an off switch. The website form and business rules must not depend on provider-specific field names.

| Provider category | Boundary | Change and failure handling |
|---|---|---|
| CRM | Upsert lead through adapter with enquiry event identifier | Approved mapping; separate durable task; outage does not reject the enquiry |
| Email | Send a versioned notification template | Server-only credentials; provider timeout and retry; verify sender/domain |
| Scheduling | Start with an approved booking link; integrate API later if useful | Accurate timezone and booking state; separate webhook contract |
| CMS | Read versioned EGAILE content models | Preserve entity IDs/slugs/assets on migration; preview and publication permission tests |
| Analytics | Send allowlisted public events | No enquiry identity/message; activate only after purpose/preferences configuration |
| Newsletter | Separate subscription workflow | Explicit optional sign-up; confirmation/unsubscribe; no automatic enquiry subscription |

Inbound webhooks verify the provider's raw-body signature and timestamp/replay rules. Persist a unique provider/event identifier before acknowledgement, then process safely. Handle duplicate and out-of-order events. Provider-specific signatures, API versions and OAuth requirements are documented when that provider is chosen, not guessed in advance.

A founder can enable an implemented integration or change approved non-secret options. Registering a new provider remains technical work. Secrets are held in environment/secret stores and are never editable public CMS content.

## 12 Security privacy and international operation

Use HTTPS, secure sessions, least privilege, strong owner-account protection, parameterised database access, safe HTML rendering, restricted script policy and private storage for backups. Keep published content, preview credentials and lead information in separate access paths. Do not compile untrusted visitor-provided HTML or MDX.

Logs contain correlation identifiers, route/result/timing and redacted provider codes. Exclude names, emails, messages, secrets and raw request bodies. Record operational status changes without copying sensitive content into audit trails.

English is the initial language. Use explicit future locale routing and translation ownership rather than a nonfunctional language picker. The public CDN can serve international users; this does not establish a database residency guarantee. Select database region and processing arrangements after confirming the actual entity, operator location, customers and privacy requirements.

## 13 Hosting cost and availability

Netlify is an initial hosting candidate with a supported Next.js runtime, not a generic static-file upload. A POST route requires runtime support; static-export mode would require a separately deployed API. Verify the current adapter and runtime before implementation: [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).

Netlify's current free credit allowance is finite and exhaustion pauses projects. Use owner alerts and forecast usage rather than assuming a free service is unlimited. Check [credit mechanics](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/). Routine CMS edits should use revalidation rather than repeated full production builds.

Supabase Free can pause low-activity databases, and backups need an explicit export/recovery plan. See [pausing](https://supabase.com/docs/guides/platform/free-project-pausing) and [backup guidance](https://supabase.com/docs/guides/platform/backups). Do not generate fake usage to avoid policies. If dependable live enquiries become essential, evaluate an always-available plan before launch.

Vercel remains an alternative on an eligible paid plan for a site advertising consultancy services. Its [fair-use rules](https://vercel.com/docs/limits/fair-use-guidelines) do not classify commercial promotion as personal use merely because revenue has not started.

Sanity plan permissions and quotas, email provider quotas, lead-console identity limits, storage, monitoring and backup destination must also be reviewed. Minimal cost is a target, not a final budget. No paid plan, automatic recharge or subscription is authorised by this design.

## 14 Scaling ownership and migration

Proposed starting assumptions are fewer than 100 public pages, a small editorial team and fewer than 500 enquiries per month. These are sizing inputs to validate, not confirmed demand or free-plan capacity claims.

Serve public content from cache; keep private data queries out of public pageviews. Measure task backlog, failed acceptance, database connection pressure, content propagation and quotas. At a projected 70 percent monthly allowance, review costs/caching or migrate before interruption. A notification task pending more than 30 minutes triggers operator review under the proposed procedure.

Keep all accounts founder-controlled. Retain source and configuration in GitHub, structured CMS exports and original media with a reference manifest, and encrypted SQL exports for operational records. The migration plan covers DNS, URLs/redirects, content identifiers, assets, secrets, integrations, lead records and rollback.

To change CMS, map entities/blocks to the new provider behind the content-access contract and compare representative pages before switching. To change database host, test a restore and permissions before moving application connections. To change email/CRM, replace the adapter and preserve event identifiers/delivery state. No component is described as replaceable without acknowledging migration work and retesting.

## 15 Operating handover and technical acceptance

Required handover includes an account register, access/recovery process, founder editing guide, lead-handling guide, publishing-failure procedure, backup schedule, tested restore and vendor-limit review. Proposed backups are daily encrypted operational exports while collecting leads, plus before migrations, with seven daily and four weekly copies subject to approved retention. CMS recovery includes a last-approved snapshot and periodic full export. Name the operator and destination before launch.

Technical acceptance covers public/draft separation, founder editing tasks, publish/revalidation failure, content restoration, negative lead-access tests, concurrent duplicate enquiry requests, transactional task storage, email timeout/retry, role revocation, safe exports, quotas and restoration. Verify accessible and responsive output generated from CMS changes, not just the initial authored pages.

No implementation source code, infrastructure, accounts or integrations have been created as part of this TDD. The next step is requirements and technology review, followed by a separate decision to implement.

## 16 Business aligned technical acceptance

| Evidence | Related functions |
|---|---|
| Public service pages and IT-services journey read from editable content, without a manufacturing-only schema | FN02 FN31 FN32 FN33 |
| Founder reorders engagement stages and previews them without code changes | FN11 FN34 |
| Illustrative examples cannot accidentally render as verified client results without approval metadata | FN35 |
| Enquiry service selection is editable, validated and shown in the lead console | FN18 FN36 |
| A service rename preserves historical enquiry labels and routes follow redirect rules | FN13 FN23 FN36 |
| Existing approved content-reference cache supports enquiry validation during a CMS outage; invalid values receive useful errors | FN19 FN22 FN36 |
| Website has no unrequested runtime AI dependency, code-upload feature or automated consulting decision | FN31 FN33 and launch exclusions |

Before implementation, inspect the founder's existing AI Studio project and map its real components against TD01 to TD08. Keep working parts where they meet the requirements. Record any proposed framework, CMS, database or hosting change with its migration impact and acceptance evidence; this TDD is a reference design, not a mandate to rebuild.

## 17 Unified admin architecture and editing implementation

Use /admin/login as the entry and /admin as the protected application shell. Suggested modules are content, homepage, services, media, appearance, navigation, SEO, enquiries and owner settings. The public application reads only published content. Admin mutations and preview access pass through server-side handlers that verify the session and required permission on every request.

Reference flow: admin browser sends an authenticated action to the application; the server verifies identity, trusted membership, allowed action and validated input; it calls the CMS content adapter or private PostgreSQL repository; it records an appropriate audit event and returns a clear saved/published/live result. Content operations and lead operations share identity but not unrestricted data permissions. A compromised content field cannot execute an operational database command.

Supabase Auth is a candidate identity provider, not a confirmed deployment. Secure, HTTP-only session cookies and supported CSRF protections are required. No public owner registration is exposed. Invitations, recovery, MFA where supported, session lifetime, revocation and membership changes are configured and tested. Authorisation uses trusted server-side memberships, never a browser-selected role. Enquiry and media export endpoints enforce their own permission checks.

Sanity remains a content-backend candidate. Using its standalone Studio with unrelated credentials is not enough to deliver the accepted UX. The proposed custom admin must implement validated editorial operations through a server-side CMS adapter, or the final CMS/identity selection must provide a verified compatible integrated experience. Do not claim that a Supabase session automatically authenticates Sanity Studio, or that provider SSO is included at no cost. Prove permissions, drafts, revision handling, asset operations and publication in a limited technical evaluation before committing. If feasibility, supported APIs or plan terms fail, record the alternative and migration impact for review.

Where a server credential is necessary, store the narrowest supported credential in the server secret store. Authorise each end-user action before using it; a broad application credential does not itself enforce user permissions. Allowlist content types, fields, mutations and query shapes. Do not expose a generic arbitrary CMS-query or mutation proxy. Technical provider consoles remain restricted maintenance tools; the founder's routine editing journey stays in the admin application.

### Editorial persistence and publication

Content records include stable ID, type, slug, draft/published state, revision identifier, updated time and actor. Use optimistic concurrency or equivalent conflict detection so a stale tab cannot silently overwrite a newer revision. Rejected writes preserve the current stored record and explain how to reload or resolve a conflict.

Save draft persists without publishing. Preview reads the authorised draft through the same identity boundary. Publish validates required fields, links, schema and permitted appearance presets, then publishes a version, requests revalidation and verifies the public result. Keep saved, published and live versions distinguishable. A failed refresh retains the last valid public version and is retryable. Revision restoration creates a new recoverable draft and requires explicit publication; it must not silently erase history.

Media upload uses server-authorised bounded operations or short-lived upload permission. Validate file signatures, size, type and dimensions as appropriate, produce optimised delivery variants, strip unnecessary metadata where feasible, and require alt text or decorative designation. Replacing a shared image warns about affected references. Private enquiry attachments are outside launch scope. No demo FileReader preview or browser-only state is accepted as production asset management.

### Appearance and accessibility configuration

Central design tokens define typography, colours, spacing, focus states and responsive behaviour. Proposed starting light-surface text colours are heading ink #10151C and body #344152 on white; these are design inputs, not proof of conformance on every surface. Implement bounded high-contrast and editorial presets, supported hero variants and motion on/off. Validate all actual combinations against NFR11, including gradients, image overlays and focus/error states. Reduced-motion preference overrides an enabled decorative animation. The founder chooses presets; unrestricted CSS, script, font injection and security changes remain technical work.

### Admin implementation acceptance

Demonstrate one login across content and permitted enquiries, role denial, recovery, expired/revoked session denial, durable drafts, safe media handling, slug collision checks, conflict detection, mobile/desktop preview, explicit publishing, visible revalidation failure, revision restoration and sign-out. Verify that unpublished drafts and private leads cannot be fetched through public pages, caches or APIs. Confirm supported service creation updates approved public listings and current enquiry choices while preserving historical labels. These checks extend the existing durable-enquiry, outbox, backup and migration tests; they do not replace them.

A single admin experience increases initial implementation work compared with linking separate vendor dashboards. Include that work and any plan limits in the delivery estimate. Ordinary content publication must not need a GitHub commit, AI Studio prompt or full application deployment. Future supported content can be added without a new table for every service or industry; new behaviours and integrations follow versioned contracts and controlled releases.
