import { supabaseServer } from '@/lib/supabase/serverClient';
import { notFound } from 'next/navigation';
import BucketDetail from '@/components/buckets/BucketDetail';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function BucketDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = supabaseServer();
  const { data: bucket, error } = await supabase
    .from('buckets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !bucket) notFound();

  const { data: contactBuckets } = await supabase
    .from('contact_buckets')
    .select('contact_id, contacts(*)')
    .eq('bucket_id', id);

  type ContactStub = { id: string; name: string | null; email: string | null; company_name: string | null };
  const bucketRows = (contactBuckets ?? []) as unknown as { contacts: ContactStub | null }[];
  const contacts: ContactStub[] = bucketRows
    .map((cb) => cb.contacts)
    .filter((c): c is ContactStub => c != null)
    .map((c) => ({ id: c.id, name: c.name ?? null, email: c.email ?? null, company_name: c.company_name ?? null }));
  const { data: allContactsData } = await supabase
    .from('contacts')
    .select('id, name, email, company_name')
    .order('name');

  const allContacts: ContactStub[] = (allContactsData ?? []).map((c) => ({
    id: c.id,
    name: c.name ?? null,
    email: c.email ?? null,
    company_name: c.company_name ?? null,
  }));

  return (
    <div className="p-6">
      <BucketDetail
        bucket={bucket}
        contactsInBucket={contacts}
        allContacts={allContacts}
      />
    </div>
  );
}
