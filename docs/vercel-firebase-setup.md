# Vercel and Firebase connection

## Connection design

Public visitors need no account. Approved staff use Firebase Google sign-in and the existing private membership checks. Vercel server code reads a request-scoped Vercel OIDC token, exchanges it at Google STS, then impersonates the dedicated runtime service account for a short-lived Google access token. No service-account private key is required.

`src/server/vercel-federation.ts` validates identifiers and supplies request tokens lazily. The Google SDK refreshes access tokens. Firebase Admin Auth uses a credential bridge; Firestore and Storage use their official Google clients with that same external-account client because Firebase Admin's database/storage factories reject a custom token credential. Local development and Google Cloud workers keep their existing ADC/emulator paths. Vercel fails closed if federation settings are missing and rejects emulator routing.

## Next Vercel settings

Add these variables to **Production only** in the EGAILE import form or project Settings → Environment Variables:

| Key                                    | Value                                                      |
| -------------------------------------- | ---------------------------------------------------------- |
| GCP_PROJECT_ID                         | egaile-c28ac                                               |
| GCP_PROJECT_NUMBER                     | 631811194995                                               |
| GCP_SERVICE_ACCOUNT_EMAIL              | egaile-vercel-runtime@egaile-c28ac.iam.gserviceaccount.com |
| GCP_WORKLOAD_IDENTITY_POOL_ID          | egaile-vercel                                              |
| GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID | egaile-vercel                                              |

Keep `FIREBASE_PROJECT_ID=egaile-c28ac`, both backend selectors set to `firebase`, and `LOCAL_OWNER_MODE=false`. Preserve the Firebase web settings already entered. Never put server credentials into `NEXT_PUBLIC_*`. Do not upload local ADC or use `GOOGLE_APPLICATION_CREDENTIALS` on Vercel for this flow.

## Cloud configuration to verify before deployment

- Pool/provider IDs: `egaile-vercel` / `egaile-vercel`, enabled in project number `631811194995`.
- Team issuer: `https://oidc.vercel.com/egaile1`; allowed audience: `https://vercel.com/egaile1`. Confirm the Vercel project's issuer mode is Team when its settings are available.
- Mapping: `google.subject = assertion.sub`.
- Condition: `assertion.sub == 'owner:egaile1:project:egaile:environment:production'`.
- The runtime service account must grant Workload Identity User to this pool's exact subject:
  `principal://iam.googleapis.com/projects/631811194995/locations/global/workloadIdentityPools/egaile-vercel/subject/owner:egaile1:project:egaile:environment:production`.
- The service account needs Cloud Datastore User for private Firestore operations. Admin SDK access uses IAM and bypasses browser Firestore rules; preserve deny-all browser rules.
- Authentication permissions remain a separate setup step. Create a project custom role with `firebaseauth.users.get`, `firebaseauth.users.update`, and `firebaseauth.users.createSession`; grant it to the runtime service account. These support account lookup, revocation checks, staff session revocation and session-cookie creation. Avoid granting Owner/Editor.
- Verify Security Token Service and IAM Service Account Credentials APIs are enabled. Also verify the project's existing Firebase Authentication and Firestore APIs.

The subject restriction deliberately grants no Preview access to the live database. Use a separate project/pool and approved identities for future preview environments. Do not broaden this production trust condition to fix a preview error.

## Final deployment checks still required

After Vercel assigns a stable hostname, set `APP_ORIGIN` to its exact HTTPS origin and add its hostname to Firebase Authentication's authorised domains. Rebuild after changing public environment variables. Keep Analytics and public launch approval disabled until the relevant checks are complete.

Confirm real published pages read from Firestore, an approved owner can create and revoke a server session, and an unapproved Google account cannot enter admin. Test content draft/publish permissions with approved staff. Token-exchange tests use simulated responses; they do not prove deployed IAM or issuer/audience configuration.

Image Storage, public enquiry App Check/trusted proxy configuration and email delivery/worker remain separate unresolved launch items. `FIREBASE_STORAGE_BUCKET` is required for uploads once the bucket exists and bucket-specific IAM is agreed. This change neither provisions Storage nor deploys a worker. No billing upgrade is performed.

## Validation on 17 October 2026

| Check                                                           | Result                         |
| --------------------------------------------------------------- | ------------------------------ |
| Full unit/repository/Firebase Auth and Firestore emulator suite | 23 passed, 0 failed, 0 skipped |
| TypeScript and Next.js production compilation                   | Passed                         |
| Firebase worker bundle                                          | Passed                         |
| Existing local ADC read of published Firestore document         | Passed; read only              |
| Production dependency audit                                     | 0 reported vulnerabilities     |
| Live Vercel token exchange, deployed admin session and IAM      | Pending deployment; not tested |

Federation tests simulate Google STS and IAM Credentials responses and verify lazy token retrieval, audience construction, service-account impersonation, access-token reuse and expiry refresh, rejected configuration, denied exchanges and refusal to use emulators on Vercel. The existing emulator suite continues to check membership, revocation and browser database denial. These checks do not replace the deployed tests above.

## References

- [Vercel OIDC with Google Cloud](https://vercel.com/docs/oidc/gcp)
- [Vercel OIDC reference](https://vercel.com/docs/oidc/reference)
- [Google Identity Platform IAM permissions](https://docs.cloud.google.com/identity-platform/docs/access-control)

Cloud setup above is based on the owner's console screenshots and confirmations. Successful live federation must be verified after deployment.
