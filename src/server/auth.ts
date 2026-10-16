import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import { backend, readStore, transaction, type RecordData } from './db';
import { can, roles, type Principal, type Permission, type Role } from '@/lib/permissions';
export const cookieName = 'egaile_session';
export const origin = () => process.env.APP_ORIGIN || 'http://127.0.0.1:3010';
export function checkOrigin(req: Request) {
  if (req.headers.get('origin') !== origin()) throw new Error('FORBIDDEN');
}
export function localOwnerAllowed() {
  return (
    backend() === 'local' &&
    process.env.NODE_ENV === 'development' &&
    process.env.LOCAL_OWNER_MODE === 'true' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin()).hostname)
  );
}
const hash = (v: string) => createHash('sha256').update(v).digest('hex');
export async function principalFromFirebase(uid: string, email: string): Promise<Principal> {
  const membership = await (
    await readStore()
  ).get<RecordData & { active: boolean; roles: Role[] }>('memberships', uid);
  if (
    !membership?.active ||
    !Array.isArray(membership.roles) ||
    !membership.roles.length ||
    membership.roles.some((r) => !roles.includes(r))
  )
    throw new Error('FORBIDDEN');
  return { uid, email, roles: membership.roles };
}
export async function currentUser(): Promise<Principal | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    if (backend() === 'firebase') {
      const { firebaseAdmin } = await import('./firebase');
      const decoded = await firebaseAdmin().auth.verifySessionCookie(token, true);
      return await principalFromFirebase(decoded.uid, decoded.email || '');
    }
    if (!localOwnerAllowed()) return null;
    const record = await (
      await readStore()
    ).get<RecordData & { expires_at: string }>('sessions', hash(token));
    return record && record.expires_at > new Date().toISOString()
      ? { uid: 'local-owner', email: 'Local development owner', roles: ['owner'] }
      : null;
  } catch {
    return null;
  }
}
export async function isOwner() {
  return !!(await currentUser());
}
export async function requirePermission(permission: Permission) {
  const user = await currentUser();
  if (!user) throw new Error('UNAUTHORISED');
  if (!can(user, permission)) throw new Error('FORBIDDEN');
  return user;
}
export async function requireOwner() {
  return requirePermission('content.read');
}
export async function createSession(idToken?: string) {
  let token: string;
  if (backend() === 'firebase') {
    if (!idToken) throw new Error('UNAUTHORISED');
    const { firebaseAdmin } = await import('./firebase');
    const { auth } = firebaseAdmin();
    const decoded = await auth.verifyIdToken(idToken, true);
    if (Date.now() / 1000 - decoded.auth_time > 300) throw new Error('UNAUTHORISED');
    await principalFromFirebase(decoded.uid, decoded.email || '');
    token = await auth.createSessionCookie(idToken, { expiresIn: 8 * 3600000 });
  } else {
    if (!localOwnerAllowed()) throw new Error('UNAUTHORISED');
    token = randomBytes(32).toString('hex');
    await transaction((db) =>
      db.set('sessions', hash(token), {
        expires_at: new Date(Date.now() + 8 * 3600000).toISOString(),
      }),
    );
  }
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 8 * 3600,
  });
}
export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token && backend() === 'local' && localOwnerAllowed())
    await transaction((db) => db.delete('sessions', hash(token)));
  jar.delete(cookieName);
}
export async function readJson(req: Request, max = 200000): Promise<unknown> {
  if (!req.headers.get('content-type')?.startsWith('application/json'))
    throw new Error('INVALID_BODY');
  const reader = req.body?.getReader();
  if (!reader) throw new Error('INVALID_BODY');
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > max) {
      await reader.cancel();
      throw new Error('TOO_LARGE');
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('INVALID_BODY');
  }
}
export function safeError(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  const known: Record<string, number> = {
    UNAUTHORISED: 401,
    FORBIDDEN: 403,
    VERSION_CONFLICT: 409,
    TOO_LARGE: 413,
    CONTENT_LIMIT: 413,
    INVALID_BODY: 400,
    NOT_FOUND: 404,
    RATE_LIMITED: 429,
    IDEMPOTENCY_CONFLICT: 409,
    INVALID_TRANSITION: 422,
  };
  const correlationId = randomBytes(8).toString('hex'),
    status = known[code] || 503;
  if (status >= 500) {
    const safeCodes = [
      'FIREBASE_CONFIGURATION_REQUIRED',
      'RATE_LIMIT_CONFIGURATION_REQUIRED',
      'PROXY_CONFIGURATION_REQUIRED',
      'PUBLIC_LAUNCH_REVIEW_REQUIRED',
      'EMULATOR_FORBIDDEN_IN_PRODUCTION',
    ];
    console.error(
      JSON.stringify({
        event: 'request.failed',
        code: safeCodes.includes(code) ? code : 'INTERNAL',
        correlationId,
        time: new Date().toISOString(),
      }),
    );
  }
  return Response.json(
    { error: known[code] ? code : 'SERVICE_UNAVAILABLE', correlationId },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Request-ID': correlationId,
        ...(code === 'RATE_LIMITED' ? { 'Retry-After': '600' } : {}),
      },
    },
  );
}
