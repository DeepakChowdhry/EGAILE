import { z } from 'zod';
import { requirePermission, checkOrigin, readJson, safeError } from '@/server/auth';
import { backend, readStore, transaction, type RecordData } from '@/server/db';
import { firebaseAdmin } from '@/server/firebase';
import { roles } from '@/lib/permissions';
import { randomUUID } from 'node:crypto';
export async function GET() {
  try {
    await requirePermission('members.manage');
    if (backend() !== 'firebase') return Response.json({ members: [], local: true });
    return Response.json(
      { members: await (await readStore()).list('memberships', 50) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    return safeError(e);
  }
}
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const owner = await requirePermission('members.manage');
    if (backend() !== 'firebase') throw new Error('FIREBASE_CONFIGURATION_REQUIRED');
    const data = z
      .discriminatedUnion('action', [
        z
          .object({ action: z.literal('grant'), email: z.email().max(254), role: z.enum(roles) })
          .strict(),
        z
          .object({ action: z.literal('revoke'), uid: z.string().regex(/^[a-zA-Z0-9_.-]{1,128}$/) })
          .strict(),
      ])
      .parse(await readJson(req, 2048));
    const auth = firebaseAdmin().auth;
    const user =
      data.action === 'grant'
        ? await auth.getUserByEmail(data.email)
        : await auth.getUser(data.uid);
    if (user.uid === owner.uid) throw new Error('FORBIDDEN');
    await transaction(async (db) => {
      const current = await db.get<RecordData>('memberships', user.uid);
      await db.set('memberships', user.uid, {
        ...current,
        email: user.email || '',
        roles: data.action === 'grant' ? [data.role] : current?.roles || [],
        active: data.action === 'grant',
        updated_at: new Date().toISOString(),
        updated_by: owner.uid,
      });
      await db.set('auditEvents', randomUUID(), {
        actor: owner.uid,
        action: 'membership.' + data.action,
        entity: user.uid,
        created_at: new Date().toISOString(),
      });
    });
    await auth.revokeRefreshTokens(user.uid);
    return Response.json({ ok: true });
  } catch (e) {
    return safeError(e);
  }
}
