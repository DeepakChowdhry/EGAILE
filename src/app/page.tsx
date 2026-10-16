import { readContent } from '@/server/content-repository';
import { Home } from '@/components/Site';
export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const { site } = await readContent();
  return {
    title: { absolute: site.seo.title },
    description: site.seo.description,
    alternates: { canonical: '/' },
  };
}
export default async function Page() {
  const { site } = await readContent();
  return <Home site={site} />;
}
