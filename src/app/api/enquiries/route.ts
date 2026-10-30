import { z } from 'zod';
import { after } from 'next/server';
import { dispatchNotifications } from '@/server/delivery';
import { checkOrigin, readJson, safeError } from '@/server/auth';
import { acceptEnquiry } from '@/server/enquiries';
import { backend } from '@/server/db';
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    if (process.env.NODE_ENV === 'production' && process.env.PUBLIC_LAUNCH_APPROVED !== 'true')
      throw new Error('PUBLIC_LAUNCH_REVIEW_REQUIRED');
    const data = await readJson(req, 16384);
    let identity = 'local-evaluation';
    if (backend() === 'firebase') {
      const token = req.headers.get('x-firebase-appcheck');
      if (!token) throw new Error('FORBIDDEN');
      const { getAppCheck } = await import('firebase-admin/app-check');
      const { firebaseAdmin } = await import('@/server/firebase');
      const verified = await getAppCheck(firebaseAdmin().app).verifyToken(token);
      // App Check is additional abuse protection; the stable IP header is configured only after validating the hosting proxy.
      const header = process.env.TRUSTED_CLIENT_IP_HEADER;
      if (!header || !process.env.RATE_LIMIT_SECRET)
        throw new Error('PROXY_CONFIGURATION_REQUIRED');
      const address = req.headers.get(header)?.split(',')[0]?.trim();
      if (!address) throw new Error('PROXY_CONFIGURATION_REQUIRED');
      identity = verified.appId + ':' + address;
    }
    const result = await acceptEnquiry(data, req.headers.get('idempotency-key') || '', identity);
    after(async () => {
      await dispatchNotifications(result.enquiryId);
    });
    return Response.json(
      { status: 'received', reference: result.reference },
      { status: 202, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    if (error instanceof z.ZodError)
      return Response.json(
        {
          error: 'VALIDATION',
          fields: Object.fromEntries(error.issues.map((i) => [i.path[0], i.message])),
        },
        { status: 422 },
      );
    return safeError(error);
  }
}
