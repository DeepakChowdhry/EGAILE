import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { backend, dataDir } from '@/server/db';
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-f0-9]{64}\.webp$/.test(file)) return new Response('Not found', { status: 404 });
  try {
    let bytes: Buffer;
    if (backend() === 'firebase') {
      const { firebaseAdmin } = await import('@/server/firebase');
      [bytes] = await firebaseAdmin()
        .bucket()
        .file('public-media/' + file)
        .download();
    } else {
      if (process.env.NODE_ENV === 'production') throw new Error();
      bytes = await readFile(path.join(dataDir(), 'uploads', file));
    }
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public,max-age=31536000,immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
