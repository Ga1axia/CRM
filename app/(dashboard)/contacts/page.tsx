import { supabaseServer } from '@/lib/supabase/serverClient';
import ContactsView from '@/components/contacts/ContactsView';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const supabase = supabaseServer();
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*, contact_buckets(bucket_id, buckets(id, name))')
    .order('created_at', { ascending: false })
    .limit(100);

  const { data: buckets } = await supabase.from('buckets').select('id, name').order('name');

  return (
    <div>
      <ContactsView initialContacts={contacts ?? []} buckets={buckets ?? []} />
    </div>
  );
}
