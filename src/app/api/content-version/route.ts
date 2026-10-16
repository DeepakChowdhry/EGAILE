import { readContent } from '@/server/content-repository';
import { safeError } from '@/server/auth';
export async function GET() {
  try {
    const { version } = await readContent();
    return Response.json({ version }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return safeError(e);
  }
}
