import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = supabaseServer();
  const { data: sequence, error: seqError } = await supabase
    .from('email_sequences')
    .select('*')
    .eq('id', id)
    .single();
  if (seqError || !sequence) return NextResponse.json({ error: seqError?.message ?? 'Not found' }, { status: 500 });

  const { data: steps } = await supabase
    .from('email_sequence_steps')
    .select('*, email_templates(id, name, subject_template)')
    .eq('sequence_id', id)
    .order('step_number');

  const { count: eventsCount } = await supabase
    .from('email_events')
    .select('*', { count: 'exact', head: true })
    .eq('sequence_id', id);
  const { data: eventsByStatus } = await supabase
    .from('email_events')
    .select('status')
    .eq('sequence_id', id);
  const sent = eventsByStatus?.filter((e) => e.status === 'sent').length ?? 0;
  const errors = eventsByStatus?.filter((e) => e.status === 'error').length ?? 0;
  const queued = eventsByStatus?.filter((e) => e.status === 'queued').length ?? 0;

  return NextResponse.json({
    ...sequence,
    steps: steps ?? [],
    stats: { total: eventsCount ?? 0, sent, error: errors, queued },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { steps: _steps, ...rest } = body;
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('email_sequences')
    .update(rest)
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (Array.isArray(_steps)) {
    const stepsToInsert = _steps
      .map((s: { step_number: number; template_id: string; delay_days: number }, i: number) => ({
        sequence_id: id,
        step_number: (s.step_number ?? i + 1),
        template_id: s.template_id,
        delay_days: s.delay_days ?? 0,
      }))
      .filter((s) => s.template_id && typeof s.template_id === 'string' && s.template_id.length > 0);
    const hasInvalidStep = _steps.length > 0 && stepsToInsert.length < _steps.length;
    if (hasInvalidStep) {
      return NextResponse.json(
        { error: 'Each step must have a template selected.' },
        { status: 400 }
      );
    }
    const { error: deleteError } = await supabase.from('email_sequence_steps').delete().eq('sequence_id', id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
    if (stepsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('email_sequence_steps').insert(stepsToInsert);
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }
  return NextResponse.json(data);
}
