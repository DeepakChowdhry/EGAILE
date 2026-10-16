import type { MetadataRoute } from 'next';
import { readContent } from '@/server/content-repository';
import { pagePath } from '@/lib/content';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { site } = await readContent();
  return [
    '',
    '/services',
    '/industries',
    '/contact',
    ...site.pages.filter((p) => p.published).map(pagePath),
  ].map((url) => ({ url: 'https://www.egaile.com' + url }));
}
