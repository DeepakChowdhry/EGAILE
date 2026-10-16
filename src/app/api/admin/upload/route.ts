import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { checkOrigin, requirePermission, safeError } from '@/server/auth';
import { backend, dataDir, readStore } from '@/server/db';
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const actor = await requirePermission('media.write');
    const length = Number(req.headers.get('content-length'));
    if (!length || length > 9 * 1024 * 1024) throw new Error('TOO_LARGE');
    const form = await req.formData(),
      file = form.get('file');
    if (!(file instanceof File) || file.size > 8 * 1024 * 1024 || file.size < 12)
      throw new Error('INVALID_BODY');
    const bytes = Buffer.from(await file.arrayBuffer());
    let image;
    try {
      image = sharp(bytes, { limitInputPixels: 25000000 });
      const metadata = await image.metadata();
      if (!['png', 'jpeg', 'webp'].includes(metadata.format || '')) throw new Error();
    } catch {
      return Response.json({ error: 'Choose a valid PNG, JPEG or WebP image.' }, { status: 422 });
    }
    const optimised = await image
      .resize({ width: 2000, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    const filename = createHash('sha256').update(optimised).digest('hex') + '.webp';
    if (backend() === 'firebase') {
      const { firebaseAdmin } = await import('@/server/firebase');
      await firebaseAdmin()
        .bucket()
        .file('public-media/' + filename)
        .save(optimised, {
          resumable: false,
          metadata: {
            contentType: 'image/webp',
            cacheControl: 'public,max-age=31536000,immutable',
          },
        });
    } else {
      if (process.env.NODE_ENV === 'production') throw new Error('FIREBASE_CONFIGURATION_REQUIRED');
      await mkdir(path.join(dataDir(), 'uploads'), { recursive: true });
      await writeFile(path.join(dataDir(), 'uploads', filename), optimised);
    }
    await (
      await readStore()
    ).set('media', filename, {
      filename,
      url: '/media/' + filename,
      bytes: optimised.length,
      uploaded_by: actor.uid,
      created_at: new Date().toISOString(),
    });
    return Response.json(
      { url: '/media/' + filename },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    return safeError(e);
  }
}
