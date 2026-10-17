# EGAILE requirements and architecture package

Package 1.4 | 16 October 2026

Start with EGAILE-Technical-Architecture-v1.0.docx for the current Firebase stack and detailed design. EGAILE-Architecture-Diagrams-v1.0.docx contains exactly two diagram pages: system topology and reliable enquiry processing. TECHNICAL-ARCHITECTURE.md is the matching editable prose source; the two MMD files are editable Mermaid diagram sources.

The baseline-v1.3 directory preserves the earlier BRD, FRD, PRD and TDD Word documents and Markdown sources without rewriting their history. Their business requirements remain applicable. The new architecture explicitly supersedes the earlier Sanity, Supabase, PostgreSQL and hosting recommendations in TDD TD02, TD03, TD06 and TD07, plus related vendor-specific implementation details. Do not implement those earlier choices alongside the Firebase baseline by mistake. Read requirement mapping and precedence in sections 1 and 12 of the new architecture.

The new baseline proposes React/Next.js/TypeScript, a custom admin CMS, Firebase Authentication, Cloud Firestore, Cloud Storage, background Cloud Functions, monitoring and Firebase App Hosting. The founder's existing AI Studio project must be inspected before implementation. EGAILE and Knovexa must have separate project data and access boundaries.

Reliable multi-user operation requires implementation and tests, not only provider selection. The architecture includes role checks, concurrent-edit protection, durable enquiries, retry processing, content and data recovery, staged releases, incident procedures and future payment/API adapters. Capacity, availability and recovery figures are proposed acceptance targets, not measured results or a support contract.

Firebase App Hosting and Storage require Blaze billing. Free allowances and any eligible activated Google AI Pro credits may offset usage; they do not guarantee zero cost. No cloud accounts, billing changes, code deployment or paid services are created by this package update.
