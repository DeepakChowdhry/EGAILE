import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { can, capabilities } from '@/lib/permissions';
import { readContent, history } from '@/server/content-repository';
import { listEnquiries } from '@/server/enquiries';
import { backend } from '@/server/db';
import { Editor } from '@/components/Editor';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Website workspace', robots: { index: false, follow: false } };
export default async function Page() {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  const { site, version } = await readContent(can(user, 'content.read'));
  return (
    <Editor
      initial={site}
      initialVersion={version}
      initialHistory={can(user, 'content.read') ? await history() : []}
      initialLeads={can(user, 'leads.read') ? await listEnquiries() : []}
      capabilities={capabilities(user)}
      identity={user.email}
      local={backend() === 'local'}
    />
  );
}
