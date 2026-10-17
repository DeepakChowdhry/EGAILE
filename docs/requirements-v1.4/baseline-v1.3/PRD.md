# EGAILE website Product Requirements Document

Version 1.3 | 16 October 2026 | Status proposed

Product owner: EGAILE founder. Domain: www.egaile.com. Stage: planning and pre-launch.

## 1 Product definition

A public website for EGAILE's IT consultancy, serving SMEs across industries through process analysis, gap identification and recommendations using AI, automation and suitable tools and techniques. Its business purpose is to attract consulting conversations about productivity, time and cost improvements. The website is supported by a founder-operated content management dashboard and a protected enquiry workflow. The product combines a professional visitor experience with practical day-to-day ownership. A website that requires a developer for routine text or page changes does not meet the product requirement.

This PRD prioritises delivery. BRD.md explains the business outcomes, FRD.md specifies behaviour and TDD.md recommends technology. The previous landing-page prototypes are reference material, not an accepted implementation. Website coding remains on hold during requirements review.

## 2 Users and product value

| User | Primary need | Successful product outcome |
|---|---|---|
| Executive buyer | Understand a relevant problem and EGAILE's approach | Finds an appropriate service and can start a conversation |
| SME owner or operations leader across industries | Find gaps in current processes and assess suitable improvements | Understands the assessment, possible automation or tool intervention and next step without speculative ROI promises |
| IT company founder or delivery leader | Identify gaps in coding, testing, review and delivery workflows | Finds a relevant productivity consulting service and can describe its current process |
| Technology leader | Understand delivery, integration and governance | Can assess the approach to existing systems and a bounded pilot |
| Founder or content manager | Keep the website current without coding | Edits content, pages, menus and supported layouts through a dashboard |
| Enquiry operator | Find and follow up requests | Retrieves enquiries, updates status and identifies delivery failures |

## 3 Service catalogue and engagement proposition

The following is a proposed public catalogue for founder review. It describes EGAILE's consulting capabilities, not software features automatically performed by the website. Publish complete, approved pages; combine related categories if there is insufficient distinct content rather than creating empty pages.

| Stable ID | Consulting category | Client problem and proposed deliverables |
|---|---|---|
| SVC01 | Process and Gap Assessment | Manual effort, delays or disconnected processes; current-state map, gap register and prioritised improvement recommendations |
| SVC02 | AI Opportunity Assessment | Unclear use cases or tool choices; opportunity assessment, feasibility/dependency review and a prioritised adoption roadmap |
| SVC03 | Workflow Automation | Repeated business tasks and handoff delays; redesigned workflow, automation recommendation and a bounded pilot plan |
| SVC04 | Software Delivery Productivity | Inefficiencies in coding, review, testing, documentation or delivery; workflow assessment, tool evaluation and a quality-aware improvement plan |
| SVC05 | Tools and Integration Advisory | Disconnected systems or overlapping tools; current-tool review, integration options and a practical solution recommendation |
| SVC06 | Implementation and Adoption Support | Difficulty turning advice into everyday practice; scoped implementation/pilot support, training, adoption and outcome review where contracted |

The proposed engagement journey is Understand the business, Assess the process, Identify and prioritise gaps, Recommend a solution, Support agreed implementation/adoption, and Review outcomes. This is descriptive wording for the website; final branded method names remain subject to founder review. A client can start with a bounded assessment rather than committing to every stage.

Time saved, processing cost, turnaround time, error/rework rate and software delivery quality are examples of measures to establish during diagnosis. The website must not present projected improvements as realised results or guaranteed returns.

## 4 Product principles

Explain business problems before technology. Make the next step clear. Let the founder maintain the site. Use existing components and providers where they meet the requirements. Keep private operational information separate from public content. Make upgrade and migration paths explicit rather than promising unlimited free operation.

## 5 Release boundaries

### Planning baseline

Deliver BRD, FRD, PRD and TDD with traceability, open decisions and a founder-editability matrix. No further page implementation, infrastructure setup, account registration, GitHub publication or deployment is part of this baseline task.

### Release one

Public page templates; approved initial content; one authenticated admin experience with founder content editing; section-based page assembly; preview and explicit publication; recoverable content revisions; a protected lead interface; reliable enquiry storage and notification; metadata and domain configuration; operator documentation and training.

The CMS is a launch dependency. This replaces the earlier proposal that content could be maintained only through Git. Technical source code can still be versioned in Git without requiring the founder to use Git for ordinary content work.

### Release one extensions

CRM, booking, newsletter, approved analytics, additional public resources and additional industry pages. Implement only after choosing a provider and confirming data mapping, permissions, costs and behaviour.

### Future product discovery

Client portal, document exchange, payments, quotation workflows, multilingual operation and AI assistance. These require new acceptance criteria and may need separate applications or security boundaries.

## 6 Proposed information architecture

| Page or template | Required content |
|---|---|
| Home | Positioning, business audience, relevant offers, method summary and primary conversation action |
| Solutions index | Process and gap assessment, AI and automation advisory, workflow improvement, software delivery productivity and agreed implementation/adoption support |
| Service detail | SVC01 to SVC06 as distinct approved pages or approved combined pages; process symptoms, assessment, interventions, deliverables, scope, proposed measures and contextual enquiry |
| Method | Approved corporate framework and relationship to any industry-specific journey |
| Industry index and detail | Cross-industry SME positioning with IT services/software companies represented; other sector pages follow approved capability and content, with no assumed manufacturing priority |
| Implementation | Approach to discovery, existing systems, pilot, adoption, measurement and scaling |
| About | Actual business identity, purpose, verified people and delivery arrangements |
| Insights index and article | Published approved content with appropriate authorship and sources; omit empty listings |
| Contact | Process-problem enquiry with editable service and optional industry/process context; privacy notice and approved direct contact alternative |
| Privacy and cookies | Practices matching the actual implementation and providers |
| Standard information page | Founder-created landing or information pages using approved blocks |
| Error and recovery pages | Useful 404, retry and temporary-service information |

Route changes require redirects. No empty careers, investors, newsroom, customer-story or office sections are required merely because the reference site has them.

## 7 Experience direction

The founder requested a polished international style similar in presentation quality to the supplied TCS screenshot, particularly editorial typography and an animated hero. The subsequently accepted direction strengthens contrast on light backgrounds: dark headings and darker body text, while allowing lighter display type in the dark hero. Preserve EGAILE's identity while using clear navigation, editorial spacing and restrained motion.

The CMS must let the founder select a supported hero treatment, change its content, replace approved media and switch motion on or off. Creating a fundamentally new animation remains technical work. The meaning and primary action must remain available when motion is paused, unsupported or reduced by user preference.

Proposed editable components are hero, rich text, image/text split, service/industry list, method stages, article list, FAQ and call to action. Each must have mobile behaviour and accessible content rules. The founder arranges these components; the technical maintainer adds new component types.

## 8 Priorities and dependencies

| Capability | Priority | Dependency or acceptance reference |
|---|---|---|
| Public service journey | Must | Approved catalogue and FN01 to FN06 |
| Founder content dashboard | Must | CMS model, account ownership and FN07 to FN17 |
| Durable enquiry and notification | Must | Database, named owner, verified sender and FN18 to FN22 |
| Lead management and exports | Must | Protected operator access and FN23 to FN26 |
| Recovery and handover | Must | Restorable content/data, training and BRD independence exercise |
| External CRM or booking | Later | Provider selected; FN27 and FN28 |
| Analytics and newsletter | Later | Defined purpose, preferences and FN29 |
| Portal and AI functionality | Later | Separate product discovery |

### Proposed routes for content planning

| Route | Purpose |
|---|---|
| /services | Catalogue grouped around client problems |
| /services/process-gap-assessment | SVC01 assessment offer |
| /services/ai-opportunity-assessment | SVC02 opportunity and readiness offer |
| /services/workflow-automation | SVC03 business workflow offer |
| /services/software-delivery-productivity | SVC04 IT-company journey |
| /services/tools-integration-advisory | SVC05 tool and integration offer |
| /services/implementation-adoption | SVC06 scoped support offer |
| /industries | Cross-industry SME audience overview |
| /industries/it-services | IT and software company context using relevant existing services |
| /approach | Descriptive engagement journey and links to approved methods |
| /contact | Start a consulting conversation |

These are proposed paths, not implemented routes. Existing AI Studio routes should be assessed before URLs are finalised. Use one canonical route per page and preserve redirects where an existing public URL changes. Other SME sector pages are created only when content supports them; the site can serve those enquiries without a dedicated sector page.

## 9 Quality requirements

| ID | Requirement | Proposed acceptance |
|---|---|---|
| NFR01 | Usable across devices | Verify 360, 390, 768, 1024 and 1440 CSS pixel widths; also check 320-pixel reflow and 200 percent text enlargement |
| NFR02 | Accessible public journeys | WCAG 2.2 AA target; keyboard and screen-reader review of navigation, CMS-produced content and enquiry states |
| NFR03 | Fast public pages | Target LCP at or below 2.5 seconds, INP at or below 200 ms and CLS at or below 0.1 at the 75th percentile when field data exists |
| NFR04 | Honest and recoverable operation | No success before durable capture; last valid public content survives a CMS or optional provider outage where hosting remains available |
| NFR05 | Secure private records | No anonymous lead access; approved roles only; no private data in public CMS, logs or analytics |
| NFR06 | Predictable content publication | Proposed healthy-service target of two minutes for live propagation with visible failure handling |
| NFR07 | Ownership and portability | Source, content, media and enquiry export plus a written migration and recovery procedure |
| NFR08 | Affordable operation | Quotas, recurring costs, responsibility and upgrade triggers recorded before public launch |
| NFR09 | Founder independence | Founder completes all ten BRD management tasks without source-code changes |

Performance and publication thresholds are proposed product targets. They are not results from a completed site or guarantees supplied by free services. Test both the public pages and the effects of the chosen CMS publishing approach.

## 10 Product measurements

Track enquiry volume, source page, service interest, qualification status and follow-up progress through authorised operational records. Define personal-data retention before collection. Do not send form contents or identities to visitor analytics.

Assess comprehension through representative review and independence through the founder exercise. Establish traffic and conversion baselines after launch before setting acquisition targets. Include publishing failures and oldest unprocessed enquiry notifications in operating review.

## 11 Delivery sequence

| Stage | Deliverable | Exit condition |
|---|---|---|
| Requirements review | This document set and decision register | Founder agrees scope, editing freedom and responsibility boundaries |
| Technology selection | CMS/hosting/database plan and operating costs | Required permissions, privacy, availability and recovery are feasible |
| Design agreement | Approved visual and interaction specifications | Desktop/mobile, hero treatments and block catalogue accepted |
| Implementation | Public site, CMS, lead functions and integrations within scope | All launch Must requirements work in a safe preview environment |
| Acceptance and handover | Recorded functional, quality and independence results | No unresolved critical defect; accounts, guide and recovery verified |
| Launch decision | Explicit owner decision to publish | Domain, production services and a real controlled test enquiry verified |

Dates and delivery estimates should follow the requirements and content review. There is no approved deadline or vendor purchase in this document set.

## 12 Acceptance and exclusions

The launch is complete only when the public experience, founder maintenance and operational reliability are all demonstrated. Attractive screens do not substitute for lead access, publishing recovery or independent editing.

Acceptance does not mean every future change can be made without a developer. The product intentionally separates routine content/configuration from new functionality, new provider integrations and changes to security or database design. This distinction must be visible in training and the handover guide.

## 13 Outstanding product decisions

The cross-industry SME IT-consultancy focus is confirmed by the founder. Confirm the initial service catalogue and sector examples, public company/contact facts, method naming, individual account owners, enquiry operator, number of editors/publishers, CMS approach, actual operating budget and legal/privacy review. TDD.md records a recommendation rather than silently settling these decisions.

Reference standards: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Web Vitals](https://web.dev/articles/vitals). Business source register: READ-ME.md.

## 14 Webpage handoff and content readiness

Before moving to the webpage, confirm the service names/grouping, initial IT-services and general SME journeys, the descriptive engagement path, and the approved public claims. Prepare one complete service example, one industry example, the enquiry labels, founder editing fields and headline direction. The earlier animation prototype supplies visual reference only.

The homepage brief should communicate IT consultancy for SMEs across industries, show the process-to-improvement approach, provide entry routes for business operations and IT/software delivery, and lead to a consulting enquiry. AI is one means of improvement; a generic AI-product or manufacturing-only landing page does not meet the product definition.

No automated diagnostic, generated consultancy report, repository access, source-code upload, ROI calculator or AI chat is required for launch. The website markets and supports consulting conversations. Client engagement tools require separate discovery and permission boundaries.

Acceptance includes the six FRD business scenarios as well as founder editing, reliable enquiries and quality/access checks. This document revision authorises requirements preparation only; webpage implementation follows a separate user instruction.

## 15 Admin product scope and accepted visual direction

The current UI and UX direction is accepted as the basis for the next stage. This revision documents the intended experience. Prototype interactions demonstrate journeys; they do not establish production authentication, durable storage, media upload, email delivery or publication.

The product includes /admin/login and a protected /admin dashboard. Once authenticated, a user sees permitted content and enquiry work within the same experience. The founder must not learn separate infrastructure tools or sign into a second editorial product for routine tasks. Individual accounts, role limits, recovery, secure sessions and owner-controlled access remain required.

The dashboard provides content listings, homepage and service editors, creation from templates, images/appearance, navigation/SEO, enquiry handling and settings. Each editor shows the current record and status, understandable validation, Save draft, desktop/mobile Preview and deliberate Publish. Successful saving, publishing and public propagation are distinct. Show errors with a useful retry or recovery path. A published page can be deliberately added to navigation; new pages are not automatically advertised in every menu.

Initial content templates cover service, industry, article and standard information pages. The founder can change titles, text, approved links, images/alt text, metadata, supported section order/visibility, contact information and supported visual presets without editing source code. Article and industry content remain subject to factual approval. Adding templates, APIs, data fields, permissions or bespoke animation is a separately estimated technical change.

The visual direction is a strong dark text hierarchy on light surfaces, generous editorial spacing, restrained brand colour and a controlled animated hero. Do not apply thin text indiscriminately to body copy. The design tokens, font licensing and accessible combinations must be verified during implementation. This direction follows the founder's contrast preference; it does not claim that thisis.com was inspected or reproduced.

| Quality ID | Additional launch condition | Verification |
|---|---|---|
| NFR10 | One coherent admin session and persistent editing | FN37 and FN39; sign out and reopen on another authorised session; verify saved state and access denial |
| NFR11 | Accessible contrast for public and admin content | Normal text at least 4.5 to 1 and large text at least 3 to 1; check applicable AA component/focus rules and motion settings |

FN37 to FN40 and NFR10 to NFR11 are Must for launch. They extend the existing scope rather than moving privacy, dependable enquiries or recovery to a later release. The release demonstration includes a founder-led draft-to-live service journey and revision restoration. A visual demo alone does not pass the release gate.

The technology decision must prove that the chosen CMS and identity arrangement can deliver this admin experience at an accepted cost. Do not present an unverified free-plan SSO capability as available. Inspect existing Google AI Studio work before deciding what can be retained or needs modification. The next implementation instruction follows review of this package; this revision itself does not deploy or publish a site.
