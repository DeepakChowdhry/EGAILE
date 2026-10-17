# EGAILE website test results — 2026-10-17

181 passed · 0 failed on final retest · 3 blocked · 2 not run.

**Release decision: cloud launch is not yet verified.** Three code defects were corrected and retested. Complete the blocked cloud configuration and live integration checks before public launch.

## Scope

Connected site: http://127.0.0.1:3010 (public browsing and read-only checks). Disposable site: http://127.0.0.1:3011 (synthetic enquiry, local admin editing, preview, publish and recovery). Firebase Auth/Firestore: demo-egaile emulators; no real memberships or business content changed.

This is a local functional regression assessment, not production acceptance. Browser checks used the Codex in-app Chromium browser: desktop public pages at 1440 px, admin at 1280 px, public/admin phone layouts at measured 320 px, and the private 390 px draft view. No Safari/Firefox, independent screen reader, production load/soak, penetration or deployed-domain test was performed. Local successes do not establish production capacity or third-party delivery.

## Defects and retest

| ID | Defect | Before | Correction / retest | Final |
|---|---|---|---|---|
| F-01 | Duplicate browser-title suffix | Process & gap assessment / EGAILE / EGAILE | Configured SEO titles now use Next.js absolute titles; public service and approach metadata retested. | PASS |
| F-02 | Cloud contact form described local storage | Firebase-connected contact page said submissions stay on this computer. | Storage notice now follows the selected database backend. Connected and disposable contact-page checks passed. | PASS |
| F-03 | Analytics blocked by Content Security Policy | Google tag script and GA4 collection hosts were absent from allowed sources. | Narrow required hosts are permitted when Analytics is enabled. Disabled mode remains closed; consent/domain/private-path gates retained and tested. Live collection remains untested. | PASS |

## Detailed results

### Connected website HTTP

| ID | Check | Final status | Evidence |
|---|---|---|---|
| PAGE-1 | Public route / | PASS | 200; main landmark and heading present |
| PAGE-2 | Public route /services | PASS | 200; main landmark and heading present |
| PAGE-3 | Public route /industries | PASS | 200; main landmark and heading present |
| PAGE-4 | Public route /approach | PASS | 200; main landmark and heading present |
| PAGE-5 | Public route /about | PASS | 200; main landmark and heading present |
| PAGE-6 | Public route /contact | PASS | 200; main landmark and heading present |
| PAGE-7 | Public route /privacy | PASS | 200; main landmark and heading present |
| PAGE-8 | Public route /cookies | PASS | 307 → /privacy |
| PAGE-9 | Public route /insights | PASS | 200; main landmark and heading present |
| PAGE-10 | Public route /solutions | PASS | 200; main landmark and heading present |
| PAGE-11 | Public route /services/process-gap-assessment | PASS | 200; main landmark and heading present |
| PAGE-12 | Public route /services/ai-opportunity-assessment | PASS | 200; main landmark and heading present |
| PAGE-13 | Public route /services/workflow-automation | PASS | 200; main landmark and heading present |
| PAGE-14 | Public route /services/software-delivery-productivity | PASS | 200; main landmark and heading present |
| PAGE-15 | Public route /services/tools-integration-advisory | PASS | 200; main landmark and heading present |
| PAGE-16 | Public route /services/implementation-adoption | PASS | 200; main landmark and heading present |
| PAGE-17 | Public route /industries/it-services | PASS | 200; main landmark and heading present |
| PAGE-18 | Public route /industries/smes | PASS | 200; main landmark and heading present |
| ASSETS | All discovered local image assets load | PASS | 5 assets |
| 404 | Unknown page returns 404 | PASS |  |
| SEO | Sitemap and prelaunch robots policy | PASS |  |
| HEADERS | Security headers and private framing policy | PASS |  |
| AUTH-content | Anonymous access denied: /api/admin/content | PASS |  |
| AUTH-enquiries | Anonymous access denied: /api/admin/enquiries | PASS |  |
| AUTH-media | Anonymous access denied: /api/admin/media | PASS |  |
| AUTH-members | Anonymous access denied: /api/admin/members | PASS |  |
| PRIVATE-/admin | Private page redirects to login: /admin | PASS |  |
| PRIVATE-/preview | Private page redirects to login: /preview | PASS |  |
| PRIVATE-/preview?frame=1 | Private page redirects to login: /preview?frame=1 | PASS |  |
| CSRF | Cross-origin sign-in is rejected | PASS |  |
| DISPATCH | Notification worker rejects anonymous access | PASS |  |
| TITLES | Public detail pages do not duplicate the brand suffix | PASS |  |
| CONTACT-STORAGE | Contact page describes the actual storage backend | PASS |  |
| GOOGLE-ONLY | Cloud sign-in cannot use local owner shortcut | PASS |  |

### Disposable API workflows

| ID | Check | Final status | Evidence |
|---|---|---|---|
| PAGE-1 | Public route / | PASS | 200; main landmark and heading present |
| PAGE-2 | Public route /services | PASS | 200; main landmark and heading present |
| PAGE-3 | Public route /industries | PASS | 200; main landmark and heading present |
| PAGE-4 | Public route /approach | PASS | 200; main landmark and heading present |
| PAGE-5 | Public route /about | PASS | 200; main landmark and heading present |
| PAGE-6 | Public route /contact | PASS | 200; main landmark and heading present |
| PAGE-7 | Public route /privacy | PASS | 200; main landmark and heading present |
| PAGE-8 | Public route /cookies | PASS | 307 → /privacy |
| PAGE-9 | Public route /insights | PASS | 200; main landmark and heading present |
| PAGE-10 | Public route /solutions | PASS | 200; main landmark and heading present |
| PAGE-11 | Public route /services/process-gap-assessment | PASS | 200; main landmark and heading present |
| PAGE-12 | Public route /services/ai-opportunity-assessment | PASS | 200; main landmark and heading present |
| PAGE-13 | Public route /services/workflow-automation | PASS | 200; main landmark and heading present |
| PAGE-14 | Public route /services/software-delivery-productivity | PASS | 200; main landmark and heading present |
| PAGE-15 | Public route /services/tools-integration-advisory | PASS | 200; main landmark and heading present |
| PAGE-16 | Public route /services/implementation-adoption | PASS | 200; main landmark and heading present |
| PAGE-17 | Public route /industries/it-services | PASS | 200; main landmark and heading present |
| PAGE-18 | Public route /industries/smes | PASS | 200; main landmark and heading present |
| ASSETS | All discovered local image assets load | PASS | 5 assets |
| 404 | Unknown page returns 404 | PASS |  |
| SEO | Sitemap and prelaunch robots policy | PASS |  |
| HEADERS | Security headers and private framing policy | PASS |  |
| AUTH-content | Anonymous access denied: /api/admin/content | PASS |  |
| AUTH-enquiries | Anonymous access denied: /api/admin/enquiries | PASS |  |
| AUTH-media | Anonymous access denied: /api/admin/media | PASS |  |
| AUTH-members | Anonymous access denied: /api/admin/members | PASS |  |
| PRIVATE-/admin | Private page redirects to login: /admin | PASS |  |
| PRIVATE-/preview | Private page redirects to login: /preview | PASS |  |
| PRIVATE-/preview?frame=1 | Private page redirects to login: /preview?frame=1 | PASS |  |
| CSRF | Cross-origin sign-in is rejected | PASS |  |
| DISPATCH | Notification worker rejects anonymous access | PASS |  |
| TITLES | Public detail pages do not duplicate the brand suffix | PASS |  |
| CONTACT-STORAGE | Contact page describes the actual storage backend | PASS |  |
| SESSION | Local QA owner receives HttpOnly SameSite cookie | PASS |  |
| DRAFT | Save draft, keep public unchanged and render private preview | PASS |  |
| STALE | Stale edits are rejected without overwriting | PASS |  |
| PREVIEW-HEADERS | Private preview allows same-origin frame only | PASS |  |
| PUBLISH | Publish and verify public content version | PASS |  |
| RESTORE | Recovery restores draft without changing public content | PASS |  |
| UPLOAD-INVALID | Reject a disguised non-image upload | PASS |  |
| UPLOAD | Optimise image, persist media record and serve it | PASS |  |
| VALIDATION | Missing enquiry fields produce field errors | PASS |  |
| ENQUIRY | Concurrent enquiry retries produce one receipt and one lead | PASS |  |
| LEAD-STATUS | Reject skipped status, then persist Reviewed | PASS |  |
| NO-EMAIL | Unconfigured email delivery does not lose enquiry | PASS |  |
| DELETE-TEST | Delete only the synthetic lead in disposable database | PASS |  |
| SIGNOUT | Sign out invalidates admin session | PASS |  |

### Browser journeys and responsive layouts

| ID | Check | Final status | Evidence |
|---|---|---|---|
| UI-01 | Desktop homepage: one H1, images and alt text, width, no local analytics | PASS |  |
| UI-02 | Journey tabs: click, ArrowRight, End, Home select the matching stage | PASS |  |
| UI-03 | FAQ expands to explain outcomes are not guaranteed | PASS |  |
| UI-04 | Header Services link opens service catalogue | PASS |  |
| UI-05 | Service title has no duplicated brand suffix | PASS | Retest: Process & gap assessment  /  EGAILE |
| DESKTOP-1 | Desktop rendered page / | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/","title":"EGAILE  /  IT consultancy for SMEs"} |
| DESKTOP-2 | Desktop rendered page /services | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/services","title":"Our capabilities  /  EGAILE"} |
| DESKTOP-3 | Desktop rendered page /industries | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/industries","title":"Industries  /  EGAILE"} |
| DESKTOP-4 | Desktop rendered page /approach | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/approach","title":"Understand the process. Make the next step count.  /  EGAILE"} |
| DESKTOP-5 | Desktop rendered page /about | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/about","title":"About EGAILE  /  IT consultancy for Delhi NCR SMEs"} |
| DESKTOP-6 | Desktop rendered page /contact | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/contact","title":"Start a conversation  /  EGAILE"} |
| DESKTOP-7 | Desktop rendered page /services/process-gap-assessment | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/services/process-gap-assessment","title":"Process & gap assessment  /  EGAILE"} |
| DESKTOP-8 | Desktop rendered page /services/ai-opportunity-assessment | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/services/ai-opportunity-assessment","title":"AI opportunity assessment  /  EGAILE"} |
| DESKTOP-9 | Desktop rendered page /services/workflow-automation | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/services/workflow-automation","title":"Workflow automation  /  EGAILE"} |
| DESKTOP-10 | Desktop rendered page /services/software-delivery-productivity | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/services/software-delivery-productivity","title":"Software delivery productivity  /  EGAILE"} |
| DESKTOP-11 | Desktop rendered page /services/tools-integration-advisory | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/services/tools-integration-advisory","title":"Tools & integration advisory  /  EGAILE"} |
| DESKTOP-12 | Desktop rendered page /services/implementation-adoption | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/services/implementation-adoption","title":"Implementation & adoption  /  EGAILE"} |
| DESKTOP-13 | Desktop rendered page /privacy | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/privacy","title":"Privacy information  /  EGAILE"} |
| DESKTOP-14 | Desktop rendered page /privacy | PASS | {"brokenImages":[],"h1":1,"missingAlt":0,"overflow":false,"path":"/privacy","title":"Privacy information  /  EGAILE"} |
| UI-08 | 320px menu opens and closes after following About link | PASS |  |
| MOBILE-1 | 320px rendered page / | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/","width":320} |
| MOBILE-2 | 320px rendered page /services | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/services","width":320} |
| MOBILE-3 | 320px rendered page /industries | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/industries","width":320} |
| MOBILE-4 | 320px rendered page /approach | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/approach","width":320} |
| MOBILE-5 | 320px rendered page /about | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/about","width":320} |
| MOBILE-6 | 320px rendered page /contact | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/contact","width":320} |
| MOBILE-7 | 320px rendered page /services/process-gap-assessment | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/services/process-gap-assessment","width":320} |
| MOBILE-8 | 320px rendered page /services/ai-opportunity-assessment | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/services/ai-opportunity-assessment","width":320} |
| MOBILE-9 | 320px rendered page /services/workflow-automation | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/services/workflow-automation","width":320} |
| MOBILE-10 | 320px rendered page /services/software-delivery-productivity | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/services/software-delivery-productivity","width":320} |
| MOBILE-11 | 320px rendered page /services/tools-integration-advisory | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/services/tools-integration-advisory","width":320} |
| MOBILE-12 | 320px rendered page /services/implementation-adoption | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/services/implementation-adoption","width":320} |
| MOBILE-13 | 320px rendered page /privacy | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/privacy","width":320} |
| MOBILE-14 | 320px rendered page /privacy | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/privacy","width":320} |
| MOBILE-15 | 320px rendered page /industries/it-services | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/industries/it-services","width":320} |
| MOBILE-16 | 320px rendered page /industries/smes | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/industries/smes","width":320} |
| MOBILE-17 | 320px rendered page /insights | PASS | {"brokenImages":[],"contentWidth":320,"h1":1,"path":"/insights","width":320} |
| MOBILE-18 | 320px rendered page /solutions | PASS | {"brokenImages":[],"contentWidth":305,"h1":1,"path":"/solutions","width":320} |
| FORM-01 | Service selection carried into contact form | PASS |  |
| FORM-02 | Empty contact form blocks submission with required fields | PASS |  |
| FORM-03 | Valid browser enquiry displays saved receipt | PASS | Synthetic visitor, disposable local database |
| ADMIN-01 | Admin sign-in opens workspace (disposable local adapter) | PASS |  |
| ADMIN-02 | Hero editor saves draft and updates version with confirmation | PASS |  |
| ADMIN-03 | Private desktop preview iframe renders saved headline | PASS |  |
| ADMIN-04 | Publish through UI reports verified public content version | PASS |  |
| ADMIN-05 | Submitted browser enquiry appears with matching reference and service in admin | PASS |  |
| ADMIN-06 | Enquiry status updates to Reviewed through UI | PASS |  |
| ADMIN-PANEL-1 | Admin panel Overview | PASS | {"fields":0,"heading":"Overview","overflow":false} |
| ADMIN-PANEL-2 | Admin panel Homepage sections | PASS | {"fields":83,"heading":"Homepage sections","overflow":false} |
| ADMIN-PANEL-3 | Admin panel Pages & services | PASS | {"fields":9,"heading":"Pages & services","overflow":false} |
| ADMIN-PANEL-4 | Admin panel Site settings | PASS | {"fields":14,"heading":"Site settings","overflow":false} |
| ADMIN-PANEL-5 | Admin panel History & recovery | PASS | {"fields":1,"heading":"History & recovery","overflow":false} |
| ADMIN-PANEL-6 | Admin panel People & access | PASS | {"fields":0,"heading":"People & access","overflow":false} |
| ADMIN-MOBILE-1 | 320px admin Overview | PASS | {"contentWidth":305,"heading":"Overview","width":320} |
| ADMIN-MOBILE-2 | 320px admin Landing hero | PASS | {"contentWidth":305,"heading":"Landing hero","width":320} |
| ADMIN-MOBILE-3 | 320px admin Homepage sections | PASS | {"contentWidth":305,"heading":"Homepage sections","width":320} |
| ADMIN-MOBILE-4 | 320px admin Pages & services | PASS | {"contentWidth":305,"heading":"Pages & services","width":320} |
| ADMIN-MOBILE-5 | 320px admin Site settings | PASS | {"contentWidth":305,"heading":"Site settings","width":320} |
| ADMIN-MOBILE-6 | 320px admin Enquiries | PASS | {"contentWidth":305,"heading":"Enquiries","width":320} |
| ADMIN-MOBILE-7 | 320px admin History & recovery | PASS | {"contentWidth":305,"heading":"History & recovery","width":320} |
| ADMIN-MOBILE-8 | 320px admin People & access | PASS | {"contentWidth":305,"heading":"People & access","width":320} |
| ADMIN-08 | Sign out returns browser to login page | PASS |  |
| UI-09 | Hero playback control toggles by keyboard and mouse | PASS |  |
| ADMIN-07 | Private preview switches to mobile 390px and renders saved content | PASS | Mobile selector, authenticated iframe, heading, navigation and CTA verified |

### Cloud readiness

| ID | Check | Final status | Evidence |
|---|---|---|---|
| CLOUD-ENQUIRY | Real Firebase enquiry submission | BLOCKED | App Check site key and trusted proxy header are not configured. Cloud write was also rejected by automatic approval review; no enquiry was sent. |
| CLOUD-MEDIA | Real Firebase image storage | BLOCKED | Configured Storage bucket is absent or not accessible; local image upload passed. |
| EMAIL | Real enquiry email delivery and worker | BLOCKED | Email provider, sender, recipient and dispatch secret still require configuration. Persistence and mocked delivery/retry behaviour passed. |
| ANALYTICS | Live GA4 consent and event delivery on egaile.com | NOT RUN | Analytics deliberately disabled locally and requires production on the exact public domain. Consent policy and enabled CSP regression passed; no live collection asserted. |
| CLOUD-GOOGLE | Fresh real Google popup sign-in and cloud staff-access changes | NOT RUN | No real account or membership changed. Emulator identity/session/rule checks passed; connected anonymous admin requests are denied and the local shortcut is rejected. |

### Local repository and policy tests

| ID | Check | Final status | Evidence |
|---|---|---|---|
| TEST-1 | drafts stay private; stale concurrent writes fail; publication and content restore are independent | PASS | 68.8131 ms |
| TEST-2 | schema rejects executable destinations, draft menu targets and duplicate route identities | PASS | 7.1588 ms |
| TEST-3 | slug changes preserve historical redirects without loops when a slug is reused | PASS | 16.4176 ms |
| TEST-4 | concurrent retry returns one receipt and atomically stores exactly one notification task | PASS | 22.5962 ms |
| TEST-5 | transaction rollback leaves no partially accepted data | PASS | 1.6991 ms |
| TEST-6 | validation rejects sensitive uploads, unknown service identifiers and unacknowledged privacy | PASS | 2.5135 ms |
| TEST-7 | rate limits do not destroy accepted requests and duplicate retry does not consume allowance | PASS | 47.1711 ms |
| TEST-8 | roles separate editing, publication, membership and private enquiry access | PASS | 0.7307 ms |
| TEST-9 | status transitions reject skipped qualification and deletion removes its task and retry mapping | PASS | 7.0531 ms |
| TEST-10 | worker handles duplicate execution, provider errors and expired leases without losing enquiries | PASS | 39.0792 ms |
| TEST-11 | production cannot silently fall back to the local database | PASS | 1.0182 ms |
| TEST-12 | enabled analytics is permitted by CSP without opening private framing or arbitrary connections | PASS | 3.8749 ms |
| TEST-13 | traffic measurement requires production and the exact public domain | PASS | 2.051 ms |
| TEST-14 | analytics cannot accept private or unapproved page paths | PASS | 0.8052 ms |
| TEST-15 | consent expires and malformed or future preferences do not opt visitors in | PASS | 1.4501 ms |

### Firebase emulator tests

| ID | Check | Final status | Evidence |
|---|---|---|---|
| TEST-1 | Firebase identity requires an active membership, not merely a valid login | PASS | 2520.8203 ms |
| TEST-2 | Firebase session cookies verify identity and reject a revoked session | PASS | 1203.5754 ms |
| TEST-3 | Firestore rules reject direct unauthorised browser reads | PASS | 936.9967 ms |
| TEST-4 | drafts stay private; stale concurrent writes fail; publication and content restore are independent | PASS | 7874.2971 ms |
| TEST-5 | schema rejects executable destinations, draft menu targets and duplicate route identities | PASS | 5.4129 ms |
| TEST-6 | slug changes preserve historical redirects without loops when a slug is reused | PASS | 328.58 ms |
| TEST-7 | concurrent retry returns one receipt and atomically stores exactly one notification task | PASS | 3784.9629 ms |
| TEST-8 | transaction rollback leaves no partially accepted data | PASS | 23.2334 ms |
| TEST-9 | validation rejects sensitive uploads, unknown service identifiers and unacknowledged privacy | PASS | 10.6957 ms |
| TEST-10 | rate limits do not destroy accepted requests and duplicate retry does not consume allowance | PASS | 465.6925 ms |
| TEST-11 | roles separate editing, publication, membership and private enquiry access | PASS | 0.6257 ms |
| TEST-12 | status transitions reject skipped qualification and deletion removes its task and retry mapping | PASS | 237.6476 ms |
| TEST-13 | worker handles duplicate execution, provider errors and expired leases without losing enquiries | PASS | 3516.6337 ms |
| TEST-14 | production cannot silently fall back to the local database | PASS | 1.4923 ms |
| TEST-15 | enabled analytics is permitted by CSP without opening private framing or arbitrary connections | PASS | 3.4459 ms |
| TEST-16 | traffic measurement requires production and the exact public domain | PASS | 2.8676 ms |
| TEST-17 | analytics cannot accept private or unapproved page paths | PASS | 0.6053 ms |
| TEST-18 | consent expires and malformed or future preferences do not opt visitors in | PASS | 0.5819 ms |

### Compilation

| ID | Check | Final status | Evidence |
|---|---|---|---|
| BUILD | Next.js production build | PASS | next build using .next-qa: exit 0; all routes compiled. |
| TYPES | TypeScript noEmit | PASS | tsc --noEmit: exit 0. |
| FUNCTIONS | Firebase notification and recovery functions build | PASS | Firebase notification and recovery functions built. |

## Repeating the tests

- Normal website running on port 3010: `npm run test:http`.
- In another terminal: `npm run qa:serve`, then `npm run test:http:isolated`. Restart the disposable server for a fresh dataset/rate allowance.
- `npm test`, `npm run typecheck`, `npm run build`, `npm run functions:build`. Use `EGAILE_BUILD_DIR=.next-qa` for a separate build while development runs.
- Firebase: Java 21+, `EGAILE_BACKEND=firebase`, `FIREBASE_PROJECT_ID=demo-egaile`, a synthetic `RATE_LIMIT_SECRET`, then `npx firebase emulators:exec --project demo-egaile --only auth,firestore "node --import tsx --test tests/*.test.ts"`.
- Browser journeys were performed through the connected in-app browser, not a checked-in cross-browser Playwright suite.

## Test-environment notes

Initial harness issues were corrected separately from product defects: the dispatch endpoint correctly returns 401 (not the initial test expectation of 403); the bundled PDF Java runtime lacked an emulator module, so a checksum-verified portable official Temurin runtime was used; the full Firestore test run initially omitted its documented synthetic RATE_LIMIT_SECRET, causing four dependent failures, then passed all 18 after correcting the test environment. The three emulator-only tests are skipped in the local run and passed in the separate emulator run. Totals count checks per environment, including repeated coverage.

Analytics policy reference: [Google tag Content Security Policy guidance](https://developers.google.com/tag-platform/security/guides/csp). Portable Java source: [Adoptium official download API](https://adoptium.net/installation/ci-scripts).
