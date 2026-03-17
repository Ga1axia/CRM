import { supabaseServer } from '@/lib/supabase/serverClient';
import { notFound } from 'next/navigation';
import CompanyView from '@/components/company/CompanyView';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ companyName: string }> };

export default async function CompanyPage({ params }: Props) {
  const { companyName } = await params;
  const decoded = decodeURIComponent(companyName);
  const supabase = supabaseServer();
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .ilike('company_name', decoded)
    .order('name');

  if (error) notFound();

  return (
    <div className="p-6">
      <CompanyView companyName={decoded} contacts={contacts ?? []} />
    </div>
  );
}
