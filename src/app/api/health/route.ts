import { backend } from '@/server/db';
export async function GET() {
  return Response.json(
    {
      status: 'running',
      edition: backend() === 'firebase' ? 'firebase' : 'local',
      publicLaunch: process.env.PUBLIC_LAUNCH_APPROVED === 'true',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
