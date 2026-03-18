import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase/serverClient';
import { sendEmail, createBrevoTransporter } from '@/lib/email/mailer';
import { renderTemplate } from '@/lib/email/templates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BATCH_LIMIT = 50;

export async function POST() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseServer();
  const now = new Date().toISOString();

  const { data: emailSettings } = await supabase
    .from('user_email_settings')
    .select('from_email, from_name, brevo_smtp_login, brevo_smtp_key')
    .eq('user_id', user.id)
    .single();
  const transporter = emailSettings?.brevo_smtp_login && emailSettings?.brevo_smtp_key
    ? createBrevoTransporter(emailSettings.brevo_smtp_login, emailSettings.brevo_smtp_key)
    : undefined;
  const fromAddress = emailSettings?.from_name
    ? `"${emailSettings.from_name.replace(/"/g, '\\"')}" <${emailSettings.from_email}>`
    : emailSettings?.from_email ?? undefined;

  const { data: events, error } = await supabase
    .from('email_events')
    .select('*')
    .eq('status', 'queued')
    .lte('scheduled_at', now)
    .limit(BATCH_LIMIT);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!events || events.length === 0) {
    return NextResponse.json({ processed: 0, results: [] });
  }

  const results: { id: string; status: string }[] = [];

  for (const event of events) {
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', event.contact_id)
      .single();

    if (contactError || !contact) {
      await supabase
        .from('email_events')
        .update({ status: 'error', error_message: contactError?.message ?? 'Contact not found' })
        .eq('id', event.id);
      results.push({ id: event.id, status: 'error' });
      continue;
    }

    const { data: template, error: tmplError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', event.template_id)
      .single();

    if (tmplError || !template) {
      await supabase
        .from('email_events')
        .update({ status: 'error', error_message: tmplError?.message ?? 'Template not found' })
        .eq('id', event.id);
      results.push({ id: event.id, status: 'error' });
      continue;
    }

    const subject = renderTemplate(template.subject_template, {
      name: contact.name ?? undefined,
      company: contact.company_name ?? undefined,
    });
    const body = renderTemplate(template.body_template, {
      name: contact.name ?? undefined,
      company: contact.company_name ?? undefined,
    });

    try {
      await sendEmail(
        {
          to: contact.email!,
          subject,
          html: body,
          from: fromAddress,
        },
        transporter
      );
      await supabase
        .from('email_events')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', event.id);
      results.push({ id: event.id, status: 'sent' });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Send failed';
      await supabase
        .from('email_events')
        .update({ status: 'error', error_message: message })
        .eq('id', event.id);
      results.push({ id: event.id, status: 'error' });
    }
  }

  return NextResponse.json({ processed: events.length, results });
}
