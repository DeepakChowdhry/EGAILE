import { notFound, permanentRedirect } from 'next/navigation';
import { readContent, lookupRedirect } from '@/server/content-repository';
import { pagePath } from '@/lib/content';
import { PageDetail } from '@/components/Site';
export const dynamic = 'force-dynamic';
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string[];
  }>;
}) {
  const url = '/' + (await params).slug.join('/');
  const { site } = await readContent();
  const page = site.pages.find((p) => p.published && pagePath(p) === url);
  return page
    ? {
        title: page.seoTitle || page.title.replace(/\n/g, ' '),
        description: page.seoDescription || page.summary,
        alternates: { canonical: url },
      }
    : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{
    slug: string[];
  }>;
}) {
  const url = '/' + (await params).slug.join('/');
  const { site } = await readContent();
  const page = site.pages.find((p) => p.published && pagePath(p) === url);
  if (page) return <PageDetail site={site} page={page} />;
  const next = await lookupRedirect(url);
  if (next && next !== url && site.pages.some((p) => p.published && pagePath(p) === next))
    permanentRedirect(next);
  notFound();
}
