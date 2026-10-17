# EGAILE website requirements package

Version 1.3 | 16 October 2026

This package updates the business, functional, product and technical requirements for www.egaile.com with the accepted admin UX and stronger text contrast. EGAILE remains an IT consultancy helping SMEs across industries analyse processes, identify gaps and apply suitable AI, automation and tools to improve productivity, time and operating cost. IT and software delivery are explicit audiences; benefits are assessed rather than guaranteed.

## Contents and reading order

1. BRD defines business need, scope, ownership and founder independence.
2. FRD defines observable functions and acceptance criteria, including FN37 to FN40 for the unified admin experience.
3. PRD defines product scope, priorities, visual direction and quality targets, including NFR10 and NFR11.
4. TDD defines the proposed technology, database, CMS, shared admin identity, integrations, security, publication and recovery design.

Each document is supplied as an editable Word DOCX and a matching Markdown source. CHANGELOG records the revision. This package contains requirements, not a deployed application. The accepted visual direction and simulated UI interactions do not establish production authentication, uploads, durable data or publishing. No external account, purchase, GitHub publication or hosting deployment is performed by this update.

## Changes in this revision

The founder requires one admin login entry, a coherent dashboard and routine management without coding. The documents now specify content templates, text and CTA editing, services/industries/articles, image and alternative-text management, section arrangement, navigation/SEO, supported appearance/hero presets, enquiry permissions, persistent drafts, preview, publish, verification and revision recovery.

The presentation uses darker headings and body text on light surfaces, with controlled lighter typography in the dark animated hero. Contrast and motion requirements apply to both the public site and admin interface. The cited thisis.com preference is recorded as a user direction, not a verified external design match.

The technical recommendation now requires a shared implemented identity and permission model. Separate routine CMS and lead sign-ins do not meet it. Next.js, a configured CMS with Sanity as a candidate, PostgreSQL with Supabase as a candidate, and replaceable third-party adapters remain proposals. A technical evaluation must verify CMS integration, identity, plan limits and cost. Inspect existing Google AI Studio work before replacing working parts.

## What the founder can change

After implementation and training, supported text, images, pages, services, industries, articles, menus, SEO, contact details, section order/visibility and appearance presets are editable without source-code work. New templates, integrations, database rules, security changes and bespoke animations need technical development. One admin entry uses individual accounts and role limits, not a shared password.

## Review and change control

The UI and UX direction is accepted as a basis for requirements. Provider selection, operating budget, approved content, actual business/contact details, named enquiry owner, retention/data region and final public methodology still require decisions. Must means required for launch unless the founder explicitly accepts a documented change; Later means outside launch. FN27 to FN30 remain Later.

Edit either the Word copy or Markdown source, record requirement IDs and the reason for the change, and reconcile both before issuing a new baseline. Track effects on cost, privacy, delivery and acceptance. The IT-company turnover example remains illustrative and is not an eligibility threshold. No business office, customer result or guaranteed saving is invented.

## Business source register

The following supplied materials inform the business requirements. The TCS reference informs presentation direction only. Source statements about plans, office presence, intellectual property and results still need the founder's factual confirmation before publication.

- [EGAILE corporate brochure](https://drive.google.com/file/d/1snxC9fsO1UybaBNyY9icB-Wsd4EV96BK/view).
- [EGAILE homepage reference](https://drive.google.com/file/d/1yMvL8n7MULVUuQYIKXQV2hCrQAovYU_-/view).
- [EGAILE branding guidelines](https://docs.google.com/presentation/d/11_jBuefPhvc4GQEUzEyKM1EtSgsKAScP/edit).
- [EGAILE launch handbook](https://drive.google.com/file/d/1kLKmqjiFPDgywaKieVdBNnZQV_HUuqcY/view), confidential input for launch priorities, not a public download.
- [Sales readiness checklist](https://docs.google.com/document/d/1M3wJjFpVQxtFuZqDFXc60ijN3iCK-6UE/edit).
- [Downloaded TCS reference](https://drive.google.com/file/d/1aBE6L0T9nWra6up2P5K0aqfICE_sJqUa/view) and the supplied full-page screenshot.

Provider facts in TDD.md were checked against official documentation on 15 October 2026. Technical proposals and estimates are not signed vendor commitments.
