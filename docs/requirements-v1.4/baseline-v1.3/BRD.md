# EGAILE website Business Requirements Document

Version 1.3 | 16 October 2026 | Status proposed

Business sponsor and decision owner: EGAILE founder, name to be recorded.

## 1 Purpose

EGAILE needs a website that presents its core IT consultancy business clearly: helping SMEs across industries understand their processes, identify gaps and apply suitable AI, automation, tools and techniques to improve productivity and reduce time and operating costs. The website must establish appropriate trust and convert interest into relevant consulting conversations. The founder must be able to maintain routine website content without depending on a developer for each change. The website must also accommodate later integrations without requiring a complete rebuild.

This document defines the business outcomes and constraints. Functional behaviour belongs in FRD.md, release decisions in PRD.md and implementation choices in TDD.md. Development is not authorised by this document's preparation.

## 2 Business context

EGAILE is in the planning and pre-launch stage. The domain www.egaile.com has been purchased. The intended markets include India, the UK and the US. The founder defines EGAILE as an IT consultancy serving SMEs across industries. Its work starts with understanding the client's actual processes and identifying gaps, then recommending suitable consulting interventions, AI, automation and other tools and techniques.

The core audience includes small and medium-sized organisations in different sectors, including IT companies. The founder gave an IT company with approximately INR 50–60 crore annual turnover as an example of a potential client. This is an illustrative commercial profile, not an eligibility threshold, a statutory SME classification or a restriction to that revenue band. Manufacturing is one possible client sector. The older manufacturing-focused handbook does not define the overall business scope.

The website should use a professional international presentation inspired by the supplied TCS reference. This does not imply the same company scale, content volume or customer history. Physical offices, client results, team biographies and credentials must reflect what is actually established.

## 3 Business problem

SMEs across industries may lose time, money and productive capacity because their processes contain manual work, repeated tasks, disconnected tools, delays or unclear handoffs. They may recognise the symptoms without knowing where the gaps lie, which changes should come first or where AI and automation would be useful. Buying another tool without understanding the process can leave the underlying problem unresolved.

EGAILE addresses this need through IT consultancy. It works with clients to analyse their existing processes, identify gaps and improvement opportunities, and recommend practical solutions using AI, automation and suitable tools and techniques. The intended outcomes are less manual effort, shorter turnaround times, better use of resources, improved productivity and lower operating costs. Solutions should fit the client's actual business, systems and capability; benefits are assessed against an agreed baseline rather than assumed in advance.

For an IT company, this can include examining the software delivery lifecycle to identify where AI-assisted coding, testing, code review, documentation or workflow automation could help teams deliver more effectively. For other SMEs, the focus may be operational workflows, reporting, customer handling or administrative processes. These are examples of areas to assess, not claims of completed engagements or guaranteed savings.

The website must make this consulting offer understandable, guide visitors towards relevant services and capture enough context to start a useful discussion. Its service catalogue, enquiry ownership and content-management arrangements support this business purpose.

## 4 Business objectives

| ID | Required business outcome | Evidence of success |
|---|---|---|
| BR01 | Communicate cross-industry IT consultancy for SMEs, centred on process analysis, gap identification and practical AI or automation opportunities | Representative reviewers can identify the client problem, the consulting approach, an intended productivity or cost benefit and the next step |
| BR02 | Generate and retain relevant enquiries | Every confirmed enquiry is retrievable by an authorised operator and has a follow-up owner |
| BR03 | Let the founder manage routine content independently | Founder completes the editing and recovery exercise in section 10 without developer assistance |
| BR04 | Allow future tools to be added or replaced | CRM, booking, CMS and email choices have defined boundaries and migration provisions |
| BR05 | Operate internationally with factual market positioning | Pages work on mobile and desktop; country references do not misrepresent office presence |
| BR06 | Keep launch costs proportionate | Provider limits, operating responsibilities and upgrade triggers are known before launch |
| BR07 | Keep ownership of business assets and data | Founder controls domain and service accounts and can obtain content, enquiry and source exports |
| BR08 | Protect information and preserve trust | Private enquiries are not public; published claims and personal data have appropriate controls |
| BR09 | Enable controlled publication and recovery | Draft preview, explicit publication and restoration of the previous approved state are demonstrated |

## 5 Stakeholders and responsibilities

| Stakeholder | Business responsibility |
|---|---|
| Founder and product owner | Business priorities, public claims, budget, scope decisions and acceptance |
| Content owner | Accuracy, media permissions, page review and content freshness; initially may be the founder |
| Enquiry owner | Daily review, assignment, response and closure; person to be named |
| Website operator | Provider accounts, access reviews, usage checks, backups and incident coordination |
| Technical maintainer | Initial implementation, updates, new capabilities, security changes and recovery support |
| Relevant legal or privacy reviewer | Review actual business identity, notice wording, contracts and data-processing arrangements when needed |
| Prospective client | Understand offerings and submit appropriate context through a usable website |

One person may hold several responsibilities initially. Combining responsibilities does not remove the need to name the person who acts when an enquiry or service fails.

## 6 Business scope

### Core consulting service scope

The proposed service catalogue covers process and gap assessment; AI and automation opportunity identification; workflow and tool advisory; software engineering productivity improvement; and implementation or adoption support where included in the agreed engagement. Each engagement defines its own deliverables and scope.

The consulting journey is to understand the business and process, establish the current baseline, identify and prioritise gaps, recommend a solution, support a bounded implementation where agreed, and review results. This describes the client journey for requirements purposes. It does not replace the founder's final names for any branded methodology.

For software delivery, possible measures include lead time, review effort, testing effort, rework and quality. For business operations, measures may include manual effort, turnaround time, error rate and processing cost. Coding productivity must not be judged by lines of generated code alone. Specific targets follow diagnosis; time or cost reductions are not guaranteed before assessment.

### Required initial capability

- Public company, service, method, industry, implementation and contact information.
- One browser-based admin experience for the founder, reached through /admin/login, covering pages, media, appearance presets, menus, SEO, supported section arrangements and permitted enquiries.
- Controlled publishing, previews and a recoverable approved version.
- A dependable enquiry process, business notification and an accessible operator view.
- Existing-domain connection, secure access and a documented operating handover.
- Ownership and export of website assets and operational records.

### Potential later capability

CRM synchronisation, meeting scheduling, newsletters, approved analytics, multilingual pages, customer evidence, additional industry content and a client portal. Each requires a separate business case and defined handling of its data.

Payments, automated quotations, personalised portals, sensitive document exchange and an AI assistant are not initial commitments. No public customer account is required for the first release.

## 7 Business rules

The founder approves the public service catalogue. Public fees, response-time promises and performance claims must be intentional business decisions. Internal sales planning rates and confidential handbook material must not become public automatically.

Corporate materials and the manufacturing handbook use different seven-stage sequences. The founder must approve whether they are separate descriptions or need a single public vocabulary. The website must not silently merge them.

An enquiry acknowledgement records that the visitor has seen the privacy information. It must not automatically subscribe the visitor to marketing. An appointment exists only after the scheduling process confirms it. A saved enquiry is not a guaranteed accepted engagement or quotation.

Routine content changes must not require source-code edits. Safety limits such as approved layout blocks, file types, link destinations and colour presets are acceptable when they are explained and still cover normal founder tasks.

## 8 Ownership and commercial constraints

The founder should own or control the registrar, GitHub organisation or repository, hosting, CMS, database and email accounts. Supplier or developer access must be revocable without losing the website.

The initial target is minimal recurring cost. This is a constraint to evaluate, not a promise that all capabilities can run free indefinitely. Role separation, backups, availability or traffic may justify a paid service. A change that introduces spending requires a recorded decision by the founder.

No assumed number of international offices, staff, customers or completed engagements may be used to fill content gaps. Country and language expansion must follow actual service capability and content ownership.

## 9 Success measures

| Measure | Proposed starting assessment |
|---|---|
| Offer comprehension | At least four of five representative reviewers understand audience, offer and next step |
| Enquiry reliability | All accepted test enquiries are retrievable; provider failure does not delete the request |
| Founder independence | All ten management tasks in section 10 completed after training |
| Content quality | No placeholder claims, unpublished drafts or confidential sales documents exposed |
| Operational readiness | Named owner, account access, restore exercise and provider limits confirmed |
| Business conversion | Track enquiry count and qualification from launch; set a conversion target after a real baseline exists |

These are proposed acceptance measures, not reported results. The business can change the targets before approval.

## 10 Founder independence acceptance exercise

The founder must be able to complete the following after training, using the delivered management tools and written guide:

1. Change the hero headline and call-to-action destination.
2. Replace a homepage image and add alternative text.
3. Change contact details consistently across the site.
4. Create a service page using an available template.
5. Add or rearrange an approved homepage section.
6. Create and publish an article with its search metadata.
7. Add a page to a navigation menu.
8. Preview mobile and desktop presentation before publication.
9. Restore the last approved version after an incorrect content edit.
10. Find an enquiry, record its status and retrieve an authorised export.

New page-component designs, unrestricted global restyling, a new API provider or changes to data/security rules require technical work. The handover must explain these boundaries rather than describing the entire system as no-code.

## 11 Risks and business decisions

| Decision or risk | Proposed treatment | Decision owner |
|---|---|---|
| Initial examples within the confirmed cross-industry SME focus | Include IT services and software delivery productivity; select other sector examples according to actual capability and approved content | Founder |
| Editing freedom versus design consistency | Approved page blocks and visual presets; add block types through controlled changes | Founder |
| Multiple people need different permissions | Choose a plan supporting those roles; do not give everyone administrator rights merely to remain free | Founder and operator |
| Free services can interrupt operations | Monitor usage and availability; agree when paying or migrating is necessary | Founder and operator |
| Enquiries have no follow-up owner | Name one before public launch | Founder |
| Vendor dependence | Require export, account ownership and a documented replacement route | Technical maintainer |
| Unverified public claims | Approve a factual content inventory before publication | Content owner |

## 12 Approval and change process

Approve business scope and ownership first, functional behaviour second, product release priorities third and the technology recommendation fourth. This is a review sequence, not an instruction to begin implementation automatically.

Maintain a change record with requirement IDs, business reason, effect on cost or data handling, decision and owner. A replacement provider is acceptable only if the corresponding business and functional requirements are still met or explicitly revised.

Business source links and document conventions are in READ-ME.md.

## 13 Approved experience direction and admin independence

The founder has accepted the current UI and UX direction as the basis for requirements updates. This records design direction, not approval of every vendor, subscription or production capability. The light-background presentation uses darker, more legible body text and strong dark headings. The animated hero may retain lighter display typography on a dark background, with a readable still state and motion controls. EGAILE retains its own identity; no external company's claims or assets are implied.

The business requires one admin login entry and a coherent dashboard. An authorised founder can move between content management, appearance, navigation, SEO and enquiry handling without a routine second sign-in. Each person uses an individual authorised account; one entry does not mean a shared password or unrestricted access for all staff.

The dashboard must support the founder's likely growth tasks without coding: create pages from approved templates; add or update services, industries and articles; reorder or hide supported sections; replace images and alternative text; change menus, contact details and calls to action; choose approved hero, contrast and motion presets; preview, save, publish, verify and restore content. New content starts as a draft. Publishing a page and adding it to a menu are separate, understandable actions.

In addition to the ten existing tasks, the founder must demonstrate sign-in and sign-out, account recovery, adding a draft service, previewing it on mobile, publishing it, placing it in navigation and restoring a previous content revision. These are launch acceptance tasks. A demo that only updates browser memory does not satisfy production acceptance.

New integrations, new component types, unrestricted styling, security policies and database changes remain technical work. The founder receives plain-language guidance identifying what can be changed independently and how to request additional capabilities.
