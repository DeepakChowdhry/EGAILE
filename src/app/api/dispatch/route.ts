import { timingSafeEqual } from 'node:crypto';
import { dispatchNotifications } from '@/server/enquiries';
export async function POST(req: Request) {
  const expected = process.env.DISPATCH_SECRET;
  const actual = req.headers.get('authorization')?.replace(/^Bearer /, '') || '';
  if (
    !expected ||
    expected.length < 32 ||
    Buffer.byteLength(actual) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  )
    return Response.json({ error: 'UNAUTHORISED' }, { status: 401 });
  return Response.json(await dispatchNotifications());
}
