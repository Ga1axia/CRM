import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseServer();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const bucketId = searchParams.get('bucketId');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)));

  let query = supabase
    .from('contacts')
    .select('*, contact_buckets(bucket_id, buckets(id, name))', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (search) query = query.or(`company_name.ilike.%${search}%,name.ilike.%${search}%`);

  const { data: allData, error: listError } = await query;
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  let data = allData ?? [];
  if (bucketId) {
    data = data.filter(
      (c: { contact_buckets?: { bucket_id: string }[] }) =>
        c.contact_buckets?.some((cb) => cb.bucket_id === bucketId)
    );
  }
  const totalCount = data.length;
  const start = (page - 1) * pageSize;
  const paginated = data.slice(start, start + pageSize);

  return NextResponse.json({ data: paginated, totalCount });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('contacts').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
