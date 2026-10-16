let instance: import('firebase/app-check').AppCheck | undefined;
export async function appCheckHeaders(): Promise<Record<string, string>> {
  if (process.env.NEXT_PUBLIC_BACKEND !== 'firebase') return {};
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (!siteKey)
    throw new Error('Enquiry protection is not configured. Please contact EGAILE directly.');
  const [{ initializeAppCheck, ReCaptchaEnterpriseProvider, getToken }, { firebaseClient }] =
    await Promise.all([import('firebase/app-check'), import('./firebase-client')]);
  instance ??= initializeAppCheck(firebaseClient().app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  const { token } = await getToken(instance);
  return { 'X-Firebase-AppCheck': token };
}
