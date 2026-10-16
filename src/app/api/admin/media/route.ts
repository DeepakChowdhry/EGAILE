import { requirePermission, safeError } from '@/server/auth';
import { readStore } from '@/server/db';
export async function GET() {
  try {
    await requirePermission('media.write');
    return Response.json(
      { media: await (await readStore()).list('media', 60, 'created_at') },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    return safeError(e);
  }
}
