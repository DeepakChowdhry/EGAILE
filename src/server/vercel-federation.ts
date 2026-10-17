import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import type { Credential } from 'firebase-admin/app';

export function federationConfig(env: Record<string, string | undefined> = process.env) {
  const projectId = env.GCP_PROJECT_ID;
  const projectNumber = env.GCP_PROJECT_NUMBER;
  const email = env.GCP_SERVICE_ACCOUNT_EMAIL;
  const pool = env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const provider = env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const id = /^[a-z][a-z0-9-]{3,61}[a-z0-9]$/;
  if (
    !projectId ||
    !id.test(projectId) ||
    projectId !== env.FIREBASE_PROJECT_ID ||
    !projectNumber ||
    !/^\d{6,20}$/.test(projectNumber) ||
    !pool ||
    !/^[a-z0-9-]{4,32}$/.test(pool) ||
    !provider ||
    !/^[a-z0-9-]{4,32}$/.test(provider) ||
    !email ||
    email.split('@').length !== 2 ||
    !/^[a-z0-9-]+$/.test(email.split('@')[0]) ||
    !email.endsWith(`@${projectId}.iam.gserviceaccount.com`)
  )
    throw new Error('VERCEL_FEDERATION_CONFIGURATION_REQUIRED');
  return {
    type: 'external_account',
    audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${pool}/providers/${provider}`,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${email}:generateAccessToken`,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  };
}

export function createFederatedAuth(
  env: Record<string, string | undefined> = process.env,
  // Read the Vercel token within the request, never at module initialization.
  supplier: () => Promise<string> = getVercelOidcToken,
) {
  const client = ExternalAccountClient.fromJSON({
    ...federationConfig(env),
    subject_token_supplier: { getSubjectToken: supplier },
  });
  if (!client) throw new Error('VERCEL_FEDERATION_CONFIGURATION_REQUIRED');
  const credential: Credential = {
    async getAccessToken() {
      const { token } = await client.getAccessToken();
      const expiry = client.credentials.expiry_date;
      if (!token || !expiry || expiry <= Date.now())
        throw new Error('FIREBASE_CREDENTIAL_UNAVAILABLE');
      return { access_token: token, expires_in: Math.floor((expiry - Date.now()) / 1000) };
    },
  };
  return { client, credential };
}
