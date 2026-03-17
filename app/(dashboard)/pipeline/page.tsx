import { supabaseServer } from '@/lib/supabase/serverClient';
import PipelineBoard from '@/components/pipeline/PipelineBoard';

export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  const supabase = supabaseServer();
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*, contact_buckets(bucket_id, buckets(id, name))')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Pipeline</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag cards between columns to update status.</p>
      </div>
      <PipelineBoard initialContacts={contacts ?? []} />
    </div>
  );
}
