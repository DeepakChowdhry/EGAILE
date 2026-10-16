import { z } from 'zod';
import { checkOrigin, createSession, endSession, readJson, safeError } from '@/server/auth';
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const data = z
      .object({ action: z.enum(['login', 'logout']), idToken: z.string().max(10000).optional() })
      .strict()
      .parse(await readJson(req, 12000));
    if (data.action === 'logout') {
      await endSession();
      return Response.json({ ok: true });
    }
    await createSession(data.idToken);
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return safeError(error);
  }
}
