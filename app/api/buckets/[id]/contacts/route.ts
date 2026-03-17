import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: bucketId } = await params;
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('contact_buckets')
    .select('contact_id, contacts(*)')
    .eq('bucket_id', bucketId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: bucketId } = await params;
  const body = await req.json();
  const contactId = body.contactId ?? body.contact_id;
  if (!contactId) return NextResponse.json({ error: 'contactId required' }, { status: 400 });

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('contact_buckets')
    .insert({ bucket_id: bucketId, contact_id: contactId })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
