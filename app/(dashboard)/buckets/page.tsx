import { supabaseServer } from '@/lib/supabase/serverClient';
import BucketList from '@/components/buckets/BucketList';

export const dynamic = 'force-dynamic';

export default async function BucketsPage() {
  const supabase = supabaseServer();
  const { data: buckets } = await supabase
    .from('buckets')
    .select('*')
    .order('name');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Buckets</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Organize contacts into groups.</p>
      </div>
      <BucketList buckets={buckets ?? []} />
    </div>
  );
}
