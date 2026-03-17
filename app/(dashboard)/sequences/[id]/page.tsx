import { supabaseServer } from '@/lib/supabase/serverClient';
import { notFound } from 'next/navigation';
import SequenceMonitor from '@/components/email/SequenceMonitor';
import SequenceBuilder from '@/components/email/SequenceBuilder';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function SequenceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = supabaseServer();
  const { data: sequence, error } = await supabase
    .from('email_sequences')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !sequence) notFound();

  const { data: steps } = await supabase
    .from('email_sequence_steps')
    .select('*, email_templates(id, name, subject_template)')
    .eq('sequence_id', id)
    .order('step_number');

  const { data: templates } = await supabase
    .from('email_templates')
    .select('id, name')
    .order('name');

  const { data: events } = await supabase
    .from('email_events')
    .select('*, contacts(id, name, email, company_name)')
    .eq('sequence_id', id)
    .order('scheduled_at', { ascending: true })
    .limit(200);

  const eventsByStatus = (events ?? []).reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-6">
      <SequenceBuilder
        sequenceId={id}
        initialSteps={steps ?? []}
        templates={templates ?? []}
      />
      <SequenceMonitor
        sequence={sequence}
        steps={steps ?? []}
        events={events ?? []}
        stats={{
          total: events?.length ?? 0,
          sent: eventsByStatus.sent ?? 0,
          error: eventsByStatus.error ?? 0,
          queued: eventsByStatus.queued ?? 0,
        }}
      />
    </div>
  );
}
