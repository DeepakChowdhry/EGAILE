import { z } from 'zod';
import { checkOrigin, requirePermission, readJson, safeError } from '@/server/auth';
import {
  listEnquiries,
  updateEnquiry,
  deleteEnquiry,
  dispatchNotifications,
  retryNotification,
} from '@/server/enquiries';
export async function GET() {
  try {
    await requirePermission('leads.read');
    return Response.json(
      { enquiries: await listEnquiries(), limit: 100 },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return safeError(error);
  }
}
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const data = z
      .object({
        action: z.enum(['status', 'delete', 'dispatch', 'retry']),
        id: z.string().uuid().optional(),
        status: z.string().optional(),
      })
      .strict()
      .parse(await readJson(req, 2048));
    const user = await requirePermission(data.action === 'delete' ? 'leads.delete' : 'leads.write');
    if (data.action === 'dispatch') return Response.json(await dispatchNotifications());
    if (data.action === 'retry') await retryNotification(data.id || '', user.uid);
    else if (data.action === 'delete') await deleteEnquiry(data.id || '', user.uid);
    else await updateEnquiry(data.id || '', data.status || '', user.uid);
    return Response.json({ ok: true });
  } catch (error) {
    return safeError(error);
  }
}
