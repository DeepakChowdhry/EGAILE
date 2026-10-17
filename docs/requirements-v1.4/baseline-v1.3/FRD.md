# EGAILE website Functional Requirements Document

Version 1.3 | 16 October 2026 | Status proposed

## 1 Purpose and priority

Define what visitors, the founder and authorised operators must be able to do for a website presenting EGAILE's cross-industry IT consultancy for SMEs. The public offer centres on process analysis, gap identification and practical improvements through AI, automation and other suitable tools and techniques. This document turns the BRD outcomes into observable behaviour and acceptance criteria. Technology selection must support these functions; the functions are not assumed to exist merely because a CMS is selected.

All FN requirements below are Must for the initial release except FN27 to FN30, which are Later. FN37 to FN40 specify the accepted admin and contrast direction and are Must for launch. FN31 to FN36 expand the business-specific website behaviour following the founder's clarification; they specify presentation and enquiries, not automated consultancy delivery. Quality requirements are defined in PRD.md. Requirement references connect functions to business outcomes in BRD.md.

## 2 Actors and access

Public visitors can read published pages and submit enquiries. A content manager maintains public content. A publisher approves live changes; the founder may combine these roles initially. An enquiry operator accesses private leads. An account owner manages membership and billing. A technical maintainer changes schemas, software, secrets and integrations.

These are logical responsibilities. The chosen tools must enforce appropriate access or document the initial single-owner arrangement. If the selected free plan cannot separate editors and publishers, the system must not claim enforced approval separation.

## 3 Public website functions

| ID | Function and required behaviour | Acceptance criterion | Business link |
|---|---|---|---|
| FN01 | Navigate public content using header, footer and page hierarchy | Desktop, mobile and keyboard navigation reach published destinations with no broken links | BR01 BR05 |
| FN02 | Explain SME process assessment, gap analysis, AI and automation advisory, and software delivery productivity services across industries | Only approved records appear; each service states audience, process problem, assessment approach, possible intervention, deliverables, proposed measures and next step | BR01 |
| FN03 | Offer role and problem entry paths | Executive and business-owner entry points lead to relevant existing pages | BR01 |
| FN04 | Present the landing hero accessibly | Text and action remain usable without animation; pause/play is available; reduced-motion preference starts still | BR01 BR05 |
| FN05 | Present articles and public resources | Articles have approval, author/date where appropriate and meaningful metadata; empty or draft content stays unavailable | BR01 BR08 |
| FN06 | Maintain regional clarity | Countries describe intended markets unless actual offices are verified; no forced country redirect | BR05 BR08 |

### Consultancy content acceptance

Published content must explain that EGAILE first understands the client's process, identifies gaps and then recommends suitable consulting solutions. IT companies must be represented as potential clients, with examples such as coding, testing, review and delivery workflows. Manufacturing may be included as a sector example without dominating the overall positioning.

An SME owner and an IT-company leader should each be able to find a relevant service, understand the kind of process gap it addresses and submit a contextual enquiry. Do not limit the enquiry form to manufacturing terms such as plant, machine or production line. A general message and editable service choices must accommodate different industries.

Illustrative measures and use cases must be distinguishable from verified client results. Do not publish the founder's INR 50–60 crore example as a mandatory turnover filter. An automated online diagnostic or AI chatbot is not required merely because EGAILE advises clients about AI.

## 4 Founder content management functions

| ID | Function and required behaviour | Acceptance criterion | Business link |
|---|---|---|---|
| FN07 | Sign in through /admin/login to one protected dashboard | Content and authorised enquiry work share the admin session; logged-out and revoked accounts cannot access protected actions | BR03 BR08 |
| FN08 | Edit text and calls to action | Founder changes a hero title, body text, button label and approved destination without touching source files | BR03 |
| FN09 | Manage media | Founder uploads/replaces an allowed image, supplies alt text or marks it decorative and sees it in preview | BR03 BR08 |
| FN10 | Create supported pages | Founder creates service, industry, standard information and article pages from defined types | BR03 BR04 |
| FN11 | Arrange supported page sections | Founder adds, removes, hides and reorders allowed sections within published layout constraints | BR03 BR09 |
| FN12 | Manage global content | Contact details, menus and footer links update consistently from central settings | BR03 |
| FN13 | Manage search metadata and URLs | Founder edits title, description and social image; duplicate/reserved paths are rejected; slug change creates a reviewed redirect | BR03 BR01 |
| FN14 | Preview drafts | Desktop/mobile preview shows unpublished changes to authorised reviewers without exposing draft data to public readers | BR09 BR08 |
| FN15 | Publish explicitly | Validated content becomes public only after Publish; failed propagation is visible; founder can verify live state | BR09 |
| FN16 | Unpublish and recover | Founder unpublishes a page safely or restores a previous approved revision without editing code | BR09 |
| FN17 | Change approved appearance settings | Founder selects supported hero treatment, animation on/off, section theme and type/spacing presets; invalid combinations are rejected | BR03 |

The initial block catalogue must include hero, rich text, image/text split, service or industry list, method stages, article list, FAQ and call-to-action section. A block has structured fields and bounded variants, not arbitrary HTML, CSS or JavaScript entry.

Menu destinations may be internal content references or approved HTTPS links. Prevent broken internal references, duplicate paths, empty required text and public links to drafts. Confirm before unpublishing a page that remains in a menu. A slug change requires old-path handling; slug reuse must not create redirect loops.

Image file size and formats are constrained by the implementation. A proposed maximum is 10 MB per original image, with optimised delivery variants; exact limits must be confirmed in the technical build. Images embedded in public pages are public assets. Confidential documents are never stored in the public media library.

## 5 Publishing workflow

The minimum workflow is Draft, Preview, Validate, Publish and Verify. A single founder can perform all stages. Multi-person approval is conditional on permissions supported by the selected plan and must be verified before being advertised as a control.

Publishing makes approved content eligible for public rendering. Successful CMS publication and successful website propagation are separate states. If propagation fails, preserve the last valid public version and show the failure to the operator. Normal content changes should appear within two minutes as a proposed service target under healthy services; confirmation uses a new uncached visitor request.

Retain one restorable approved revision independently of limited vendor history. Recover a mistakenly changed title and section order during acceptance testing. A code rollback alone is not content recovery.

## 6 Enquiry capture functions

| ID | Function and required behaviour | Acceptance criterion | Business link |
|---|---|---|---|
| FN18 | Collect an appropriately bounded enquiry | Required name, email, company, message and privacy acknowledgement; optional country, service, industry and process area; no forced phone, turnover threshold or sensitive upload | BR02 BR08 |
| FN19 | Validate and control abuse | Invalid fields have accessible errors; size/type/origin/rate controls prevent insertion when rejected | BR02 BR08 |
| FN20 | Confirm durable receipt | Success appears only after the enquiry and delivery task are saved atomically; retry does not duplicate the record | BR02 |
| FN21 | Notify the business reliably | Failed email delivery leaves a retrievable enquiry and visible pending/failed task with a retry route | BR02 |
| FN22 | Give an honest failure experience | Network/database failure preserves fields temporarily and offers retry; no false success or invented response-time promise | BR02 BR08 |

### Enquiry field rules

| Field | Rule |
|---|---|
| Name | Required; 2 to 100 characters |
| Email | Required; valid address syntax; maximum 254; accept personal and business domains |
| Company | Required; 2 to 150 characters |
| Message | Required; 20 to 3000 characters; render safely as text |
| Service | Optional; validated against supported choices |
| Country | Optional; validated country code |
| Industry | Optional; founder-managed approved choices, plus Other and Not sure; no manufacturing default |
| Process area | Optional; approved general choices such as software development, testing/review, operations, reporting, customer handling or administration; Other and Not sure allowed |
| Privacy acknowledgement | Required for this proposed form; record notice version and timestamp; not a marketing subscription |
| Source page | System value; relative allowlisted path without sensitive query strings |

States are empty, editing, invalid, submitting, received, temporarily failed and rate limited. Announce errors and success to assistive technology. Duplicate clicks are prevented while sending. A retry of the same submission uses the same key. Changed content is a new submission. Do not persist form text in browser local storage or place it in a URL.

## 7 Operator and ownership functions

| ID | Function and required behaviour | Acceptance criterion | Business link |
|---|---|---|---|
| FN23 | Review and manage enquiries | Authorised operator lists, filters, opens and changes status through a browser interface; changes record actor/time | BR02 BR03 BR08 |
| FN24 | Control export and deletion | Approved operator exports permitted fields and deletes or expires records under the agreed policy; public visitors cannot read them | BR07 BR08 |
| FN25 | Show operating failures and limits | Owner can identify failed notifications, publication failures and provider-usage alerts with a written response procedure | BR02 BR06 |
| FN26 | Hand over ownership and recoverability | Founder receives owned accounts, recovery guidance, content/data export and a tested restoration procedure | BR07 BR09 |

Enquiry states are New, Reviewed, Contacted, Qualified, Unqualified and Closed. Proposed permitted moves: New to Reviewed; Reviewed to Contacted or Unqualified; Contacted to Qualified or Unqualified; any resolved case to Closed. Reopening requires a reason and audit record. No enquiry may be deleted merely because an email or CRM call fails.

The operator interface can be a suitably configured existing tool or a small protected lead console, but access to all infrastructure tables must not be required for normal sales follow-up. The tools must demonstrate the specified access restrictions. A future CRM is not assumed to meet these launch requirements before it is connected.

## 8 Later integration functions

| ID | Function and required behaviour | Acceptance criterion before activation | Business link |
|---|---|---|---|
| FN27 | Send selected lead fields to a chosen CRM | Mappings approved; retries and deduplication tested; CRM outage does not reject an enquiry | BR04 |
| FN28 | Offer appointment booking | Provider selected; booking/cancellation/timezone states accurate; an enquiry receipt does not imply a meeting exists | BR04 BR05 |
| FN29 | Add newsletter or optional analytics | Separate subscription/preferences; no private enquiry details in analytics; unsubscribe and deletion considered | BR04 BR08 |
| FN30 | Add languages or client capabilities | Translation ownership and URL rules agreed, or separate portal authentication/data requirements approved | BR04 BR05 |

A founder can change an already-supported booking destination or disable an enabled connector through safe settings. Adding an entirely new API provider, OAuth flow or webhook algorithm remains a technical change.

## 9 Consultancy journeys and business specific functions

| ID | Function and required behaviour | Acceptance criterion | Business link |
|---|---|---|---|
| FN31 | Present a cross-industry SME offer | Homepage and service navigation identify EGAILE as an IT consultancy; IT companies and other SMEs both have relevant entry paths; no manufacturing-only language or turnover eligibility filter | BR01 BR05 |
| FN32 | Explain consulting services through process problems | Each published service states the process gap, assessment, possible intervention, deliverables, dependencies and proposed business measures | BR01 |
| FN33 | Explain software delivery productivity consulting | An IT-company leader can explore coding, review, testing, documentation and delivery workflow examples; productivity is assessed alongside quality and rework rather than lines of code alone | BR01 BR08 |
| FN34 | Explain the consulting engagement journey | Visitor can follow discovery, process assessment, gap prioritisation, recommendation, agreed pilot/adoption support and outcome review; no step implies an automatic contract or guaranteed result | BR01 BR02 |
| FN35 | Distinguish use cases from proven client outcomes | Illustrative examples are labelled; a client-result record requires supporting evidence and publication permission before it can appear as a case study | BR01 BR08 |
| FN36 | Preserve useful cross-industry enquiry context | Service-page enquiries carry editable service selection; optional industry/process area are visible to the operator and retained through approved exports; unknown values do not bypass server validation | BR02 BR03 BR08 |

### SME owner journey

Visitor arrives on Home or a service page, recognises a process problem, explores the assessment approach, sees possible deliverables and starts a conversation. The enquiry asks for a concise process description rather than a full diagnostic dataset. Receipt means the request was saved, not that an assessment has been performed or an engagement accepted.

### IT company leader journey

Visitor finds Software Delivery Productivity, explores illustrative coding, testing, review or delivery bottlenecks, reads how EGAILE would assess tools and workflow, and submits an enquiry with the relevant service selected. A company with approximately INR 50–60 crore annual turnover is an example audience, not a mandatory qualification rule or a legal definition of an SME.

### Enquiry operator journey

Operator reviews the request and context, records follow-up, and decides whether a discovery discussion is appropriate. Qualification is a human consulting decision. The website does not automatically recommend software, score a business, calculate guaranteed savings or issue a proposal. Consultant working papers and client assessment data remain outside the initial website scope.

### Founder maintenance journey

Founder can change service labels and descriptions, add an industry using the existing type, relate a service to several industries, edit process examples and reorder the engagement journey without code changes. A new page type, automated assessment, new integration or private client workspace remains technical work. Existing enquiry references remain readable after a service is renamed or retired.

### Proposed content taxonomy

The six proposed consulting categories are Process and Gap Assessment; AI Opportunity Assessment; Workflow Automation; Software Delivery Productivity; Tools and Integration Advisory; and Implementation and Adoption Support. Their identifiers and scope are specified in PRD.md. Labels and public wording remain editable; publication requires approved service content.

A service may apply to multiple industries. The generic industry index must not imply completed work in every displayed sector. Not sure and Other are legitimate enquiry choices, and turnover is not collected by default. Example process descriptions contain no real client secrets, source code or proprietary datasets.

## 10 Access and recovery scenarios

Acceptance must cover a logged-out visitor attempting to retrieve leads; an editor attempting an owner-only action; preview links used after expiry; draft content requested through a public API; failed publication; revoked user access; duplicate enquiry retry; permanent email failure; and recovery of a bad content edit. Each scenario must either deny access or preserve the defined safe state.

## 11 Requirements traceability

| Business requirement | Functional coverage | Related technical decision |
|---|---|---|
| BR01 | FN01 to FN05 FN13 FN31 to FN35 | TD01 TD02 |
| BR02 | FN18 to FN25 FN34 FN36 | TD03 TD04 TD06 |
| BR03 | FN07 to FN17 FN23 FN26 FN36 | TD02 TD06 |
| BR04 | FN10 FN27 to FN30 | TD01 TD05 TD08 |
| BR05 | FN01 FN04 FN06 FN28 FN30 FN31 | TD01 TD07 |
| BR06 | FN25 FN26 | TD07 |
| BR07 | FN24 FN26 | TD08 |
| BR08 | FN05 FN07 FN09 FN14 FN18 FN19 FN22 to FN24 FN29 FN33 FN35 FN36 | TD03 TD06 |
| BR09 | FN11 FN14 to FN16 FN26 | TD02 TD08 |

## 12 Acceptance ownership

The founder verifies business meaning and management independence. A representative visitor verifies the public journey. The enquiry owner verifies follow-up and recovery. The technical maintainer provides evidence for access boundaries, durable capture, publication propagation and restoration. Record results against the FN identifiers; unfinished Must requirements cannot be silently moved to a later release.

## 13 Business scenario acceptance pack

| Scenario | Expected result |
|---|---|
| Operations SME with repetitive reporting | Finds process/gap or automation service, sees illustrative deliverables and submits without manufacturing-specific fields |
| IT company seeking more effective software delivery | Finds software productivity service and examples covering workflow, quality and delivery; no unsupported savings claim |
| Visitor unsure which tool is needed | Can select Not sure and describe the problem without choosing a technology |
| Founder adds an industry and relates an existing service | Preview and publication work without changing code or introducing a new database column |
| Founder renames a service after an enquiry arrives | Operator still sees historical context; public route changes follow redirect rules |
| Claimed client result lacks evidence or permission | Publication as a verified case study is blocked; an explicitly illustrative use case remains distinct |

Record these results alongside the existing access, recovery and founder-independence checks. Website functionality does not constitute delivery of the consultancy service itself.

## 14 Unified admin experience and visual controls

| ID | Function and required behaviour | Acceptance criterion | Business link |
|---|---|---|---|
| FN37 | Use one admin entry with individual accounts, recovery and session controls | Sign-in opens permitted dashboard areas without a second routine CMS or lead sign-in; recovery gives a generic response; sign-out, expiry and revocation block further protected requests | BR03 BR08 |
| FN38 | Add and manage content using supported templates | Founder creates a service, industry, standard page or article; required fields, preview, draft status and navigation placement are understandable; a draft is not publicly reachable | BR03 BR04 BR09 |
| FN39 | See saved, published and live states with revision recovery | Changes survive sign-out and another authorised session; save does not publish; publication failure is visible; restore creates a recoverable revision and requires deliberate publication | BR03 BR09 |
| FN40 | Apply readable appearance presets without code | Approved presets retain required text contrast and keyboard focus; motion off and reduced-motion modes work; unsupported colour or typography combinations cannot be published | BR03 BR05 BR08 |

The dashboard navigation comprises Pages and content, Homepage, Services, Add content, Images and appearance, Navigation and SEO, Enquiries and Settings. These are user-facing work areas; their arrangement may change if all required tasks remain easy to find. Settings expose approved configuration, account controls and operating status according to role. They do not expose arbitrary scripts, server secrets or database administration.

The login page provides labelled email and password fields, password visibility control where appropriate, recovery, useful validation and clear busy/error states. There is no open public admin registration. Owner-authorised invitations, supported multi-factor protection, lockout/rate controls and secure sessions are required. Logged-out direct links return to sign-in and then to an allowed destination. Content access does not automatically confer enquiry, export, membership or billing privileges.

Homepage editing covers headline, introduction, CTA label/destination and supported section order/visibility. Service editing covers title, summary and the structured service fields in FN32. Media controls provide allowed upload/replacement, preview, alt text or decorative designation, and a warning about public assets. Navigation uses published content references and permitted external links. SEO includes search title, description, social image and a preview that does not promise a search ranking.

For text, the acceptance target is contrast of at least 4.5 to 1 for normal text and 3 to 1 for large text. Interactive boundaries and focus indicators must meet applicable WCAG 2.2 AA criteria. Check actual combinations, overlays, hover/focus/error states and CMS-created pages; a dark-looking colour alone is insufficient evidence. The admin interface meets the same usability and contrast requirements as public journeys.

Test FN37 to FN40 with a nontechnical founder: sign in, add a service as draft, enter content and metadata, preview mobile and desktop, publish, verify an uncached live request, add a menu reference, sign out and sign in again, restore an earlier revision and republish. Verify unauthorised reads/writes, expired sessions, rejected uploads and failed publication. Record persistence and live-state evidence, not only prototype screenshots.

Additional traceability: FN37 maps to TD02 and TD06; FN38 and FN39 map to TD02 and TD08; FN40 maps to TD01 and TD02. Business coverage extends BR03, BR04, BR05, BR08 and BR09 as indicated above.
