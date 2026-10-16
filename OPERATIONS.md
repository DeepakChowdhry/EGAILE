# EGAILE operating procedures

## Ownership and environments

Keep the repository, domain, Firebase projects, billing and email provider founder-controlled. Use separate staging and production projects. Never reuse Knovexa memberships or client records. Keep server credentials in authorised managed identity/secret storage. The app's local mode cannot run in production.

## Incident steps

1. Check the website and `/api/health`. This endpoint is liveness only; it does not prove that the database, email or backups are healthy.
2. For an enquiry issue, find the receipt in the protected dashboard. A missing receipt after an error means the visitor must retry; do not invent a successful capture.
3. For email failure, inspect delivery state, fix provider/sender/quota configuration and requeue a failed task. The leased worker and scheduled sweep handle due recoverable work after deployment. Do not manually resend repeatedly without checking the existing task.
4. For a content error, restore a known published revision into a draft, preview and publish. Confirm the version endpoint and a fresh public request.
5. For a software regression, redeploy the last verified commit, then verify public routes, access controls and a controlled test enquiry. Code rollback does not restore Firestore data or content.
6. For unwanted account access, disable membership and revoke sessions through authorised tools. Verify a denied request with the old session.
7. For database loss or corruption, stop unsafe mutations and use the approved restore procedure in an isolated environment first. Do not restore test data over production without verifying the target.

## Configure before production

Name the primary and backup responder and define coverage hours. Configure alerts for failed enquiry capture, worker backlog/lease expiry, repeated delivery failures, publication mismatch, authentication failures, runtime errors, quota/cost pressure and backup age. Log only safe codes, timings and correlation IDs. Do not record raw form bodies or credentials.

Enable a costed backup/export plan for Firestore, media, identity configuration and necessary user recovery, source and deployment settings. Firestore backups do not include Auth accounts or Storage media. Record retention, destination, access and expiry. Restore into staging before launch, after material schema changes and on the agreed recurring schedule. RPO and RTO in the architecture are proposed targets, not achieved guarantees.

Review region choices, IAM, App Check enforcement, session protection/MFA, trusted proxy behaviour, sender identity, public notices and budgets. Set usage alerts and runtime limits, understanding that alerts are not universal hard spending caps. Confirm eligible Google credits and their expiry. The included templates do not automatically complete any of these operating tasks.

## Capacity review

The application has bounded content and query limits documented in README. Before staff expansion or traffic growth, test the actual expected workload in staging. Review database operations, indexes, public cache behaviour, task backlog, response latency, errors and cost. Extend pagination and snapshot storage when measured needs justify it. A future client portal needs tenant isolation and separate acceptance criteria.
