import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

const MAX_CONTACTS_LAUNCH = 200;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: sequenceId } = await params;
  const body = await req.json().catch(() => ({}));
  const { category, bucketId, status, contactIds } = body;

  const supabase = supabaseServer();

  let contactList: { id: string }[];
  if (Array.isArray(contactIds) && contactIds.length > 0) {
    contactList = contactIds.slice(0, MAX_CONTACTS_LAUNCH).map((id: string) => ({ id }));
  } else {
    let q = supabase.from('contacts').select('id');
    if (category) q = q.eq('category', category);
    if (status) q = q.eq('status', status);
    const { data: contacts, error } = await q.limit(MAX_CONTACTS_LAUNCH);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    contactList = (contacts ?? []).map((c) => ({ id: c.id }));
    if (bucketId) {
      const { data: inBucket } = await supabase
        .from('contact_buckets')
        .select('contact_id')
        .eq('bucket_id', bucketId);
      const bucketContactIds = new Set((inBucket ?? []).map((r) => r.contact_id));
      contactList = contactList.filter((c) => bucketContactIds.has(c.id));
    }
  }

  const { data: steps, error: stepsError } = await supabase
    .from('email_sequence_steps')
    .select('*')
    .eq('sequence_id', sequenceId)
    .order('step_number');
  if (stepsError || !steps?.length) return NextResponse.json({ error: 'Sequence or steps not found' }, { status: 400 });

  const now = new Date();
  const events: { contact_id: string; sequence_id: string; step_number: number; template_id: string; status: string; scheduled_at: string }[] = [];

  for (const contact of contactList) {
    let delayDays = 0;
    for (const step of steps) {
      delayDays += step.delay_days ?? 0;
      const scheduled = new Date(now);
      scheduled.setDate(scheduled.getDate() + delayDays);
      events.push({
        contact_id: contact.id,
        sequence_id: sequenceId,
        step_number: step.step_number,
        template_id: step.template_id,
        status: 'queued',
        scheduled_at: scheduled.toISOString(),
      });
    }
  }

  const { error: insertError } = await supabase.from('email_events').insert(events);
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ enrolled: contactList.length });
}
