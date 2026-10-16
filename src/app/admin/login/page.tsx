import { redirect } from 'next/navigation';
import { isOwner, localOwnerAllowed } from '@/server/auth';
import { Login } from '@/components/Login';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Owner sign in', robots: { index: false, follow: false } };
export default async function Page() {
  if (await isOwner()) redirect('/admin');
  return <Login local={localOwnerAllowed()} />;
}
