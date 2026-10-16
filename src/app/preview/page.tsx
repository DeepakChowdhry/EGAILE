import { redirect, notFound } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { can } from '@/lib/permissions';
import { readContent } from '@/server/content-repository';
import { pagePath } from '@/lib/content';
import { Home, PageDetail } from '@/components/Site';
import { PreviewWorkbench } from '@/components/PreviewWorkbench';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Private draft preview', robots: { index: false, follow: false } };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; frame?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  if (!can(user, 'content.read')) notFound();
  const { page, frame } = await searchParams;
  if (frame !== '1') return <PreviewWorkbench page={page} />;
  const { site } = await readContent(true);
  if (page) {
    const record = site.pages.find((p) => p.id === page);
    if (!record) notFound();
    return (
      <>
        <div className="preview-banner">Private page preview · {pagePath(record)}</div>
        <PageDetail site={site} page={record} />
      </>
    );
  }
  return <Home site={site} preview />;
}
