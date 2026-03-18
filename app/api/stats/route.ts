import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseServer();

  const [
    { count: contactsCount },
    { data: statusRows },
    { count: sequencesCount },
    { count: templatesCount },
    { count: bucketsCount },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('status'),
    supabase.from('email_sequences').select('*', { count: 'exact', head: true }),
    supabase.from('email_templates').select('*', { count: 'exact', head: true }),
    supabase.from('buckets').select('*', { count: 'exact', head: true }),
    supabase
      .from('email_events')
      .select('id, status, sent_at, scheduled_at, contact_id, sequence_id')
      .order('scheduled_at', { ascending: false })
      .limit(10),
  ]);

  const contactsByStatus: Record<string, number> = {};
  (statusRows ?? []).forEach((r: { status?: string }) => {
    const s = r.status || 'unknown';
    contactsByStatus[s] = (contactsByStatus[s] ?? 0) + 1;
  });

  // Avoid spreading `Set` (can fail under older TS target configs).
  const contactIds: string[] = [];
  const seenContactIds: Record<string, true> = {};
  for (const e of recentEvents ?? []) {
    const id = (e as { contact_id?: string }).contact_id;
    if (id && !seenContactIds[id]) {
      seenContactIds[id] = true;
      contactIds.push(id);
    }
  }

  const sequenceIds: string[] = [];
  const seenSequenceIds: Record<string, true> = {};
  for (const e of recentEvents ?? []) {
    const id = (e as { sequence_id?: string | null }).sequence_id;
    if (id && !seenSequenceIds[id]) {
      seenSequenceIds[id] = true;
      sequenceIds.push(id);
    }
  }
  const { data: contactsList } = contactIds.length > 0
    ? await supabase.from('contacts').select('id, name, email, company_name').in('id', contactIds)
    : { data: [] };
  const { data: sequencesList } = sequenceIds.length > 0
    ? await supabase.from('email_sequences').select('id, name').in('id', sequenceIds)
    : { data: [] };
  const contactsMap = new Map((contactsList ?? []).map((c: { id: string }) => [c.id, c]));
  const sequencesMap = new Map((sequencesList ?? []).map((s: { id: string }) => [s.id, s]));

  const recentEventsWithDetails = (recentEvents ?? []).map((e: { contact_id: string; sequence_id: string; [k: string]: unknown }) => ({
    ...e,
    contact: contactsMap.get(e.contact_id),
    sequence: e.sequence_id ? sequencesMap.get(e.sequence_id) : null,
  }));

  return NextResponse.json({
    contacts: contactsCount ?? 0,
    contactsByStatus,
    sequences: sequencesCount ?? 0,
    templates: templatesCount ?? 0,
    buckets: bucketsCount ?? 0,
    recentEvents: recentEventsWithDetails,
  });
}
