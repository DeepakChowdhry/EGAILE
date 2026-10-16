import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { checkOrigin, requirePermission, readJson, safeError } from '@/server/auth';
import { readContent, writeContent, history, restoreContent } from '@/server/content-repository';
export async function GET() {
  try {
    await requirePermission('content.read');
    return Response.json(
      { ...(await readContent(true)), history: await history() },
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
        action: z.enum(['save', 'publish', 'restore']),
        version: z.number().int().positive(),
        site: z.unknown().optional(),
        id: z.string().uuid().optional(),
      })
      .strict()
      .parse(await readJson(req, 300000));
    const user = await requirePermission(
      data.action === 'publish' ? 'content.publish' : 'content.write',
    );
    const version =
      data.action === 'restore'
        ? await restoreContent(data.id || '', data.version, user.uid)
        : await writeContent(data.site, data.version, data.action, user.uid);
    if (data.action === 'publish') revalidateTag('egaile-public-content', { expire: 0 });
    return Response.json(
      { version, publication: data.action === 'publish' ? 'published' : 'draft' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    if (error instanceof z.ZodError)
      return Response.json(
        {
          error: 'VALIDATION',
          details: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        },
        { status: 422 },
      );
    return safeError(error);
  }
}
