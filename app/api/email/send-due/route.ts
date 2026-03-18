import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase/serverClient';
import { sendEmail, createBrevoTransporter } from '@/lib/email/mailer';
import { renderTemplate } from '@/lib/email/templates';
import type { Transporter } from 'nodemailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_BATCH_LIMIT = 10;

type EmailEventRow = {
  id: string;
  contact_id: string;
  template_id: string;
  launched_by_user_id: string | null;
  scheduled_at: string;
};

type ContactRow = {
  id: string;
  name: string | null;
  email: string | null;
  company_name: string | null;
};

type TemplateRow = {
  id: string;
  subject_template: string;
  body_template: string;
};

type UserEmailSettingsRow = {
  user_id: string;
  from_email: string;
  from_name: string | null;
  brevo_smtp_login: string;
  brevo_smtp_key: string;
};

function escapeQuotes(input: string) {
  return input.replace(/"/g, '\\"');
}

export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  const now = new Date().toISOString();

  // If SEND_DUE_SECRET is set, this endpoint can be called by an external scheduler
  // (cron-free Vercel, GitHub Actions, etc) without needing a logged-in user.
  const secret = process.env.SEND_DUE_SECRET;
  const providedSecret = req.headers.get('x-crm-secret');

  let allowedUserId: string | null = null;
  if (secret) {
    if (!providedSecret || providedSecret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    allowedUserId = user.id;
  }

  const batchLimit = Number(process.env.SEND_DUE_BATCH_LIMIT ?? DEFAULT_BATCH_LIMIT);

  let eventsQuery = supabase
    .from('email_events')
    .select('id, contact_id, template_id, launched_by_user_id, scheduled_at')
    .eq('status', 'queued')
    .lte('scheduled_at', now)
    .limit(batchLimit);

  if (allowedUserId) {
    eventsQuery = eventsQuery.eq('launched_by_user_id', allowedUserId);
  }

  const { data: events, error } = await eventsQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const emailEvents = (events ?? []) as EmailEventRow[];
  if (emailEvents.length === 0) return NextResponse.json({ processed: 0, results: [] });

  const contactIds: string[] = [];
  const seenContacts: Record<string, true> = {};
  const templateIds: string[] = [];
  const seenTemplates: Record<string, true> = {};
  const userIds: string[] = [];
  const seenUsers: Record<string, true> = {};

  for (const e of emailEvents) {
    const cId = e.contact_id;
    if (cId && !seenContacts[cId]) {
      seenContacts[cId] = true;
      contactIds.push(cId);
    }
    const tId = e.template_id;
    if (tId && !seenTemplates[tId]) {
      seenTemplates[tId] = true;
      templateIds.push(tId);
    }
    const uId = e.launched_by_user_id;
    if (uId && !seenUsers[uId]) {
      seenUsers[uId] = true;
      userIds.push(uId);
    }
  }
  let contactsList: ContactRow[] = [];
  if (contactIds.length > 0) {
    const { data, error: contactsError } = await supabase
      .from('contacts')
      .select('id, name, email, company_name')
      .in('id', contactIds);
    if (contactsError) return NextResponse.json({ error: contactsError.message }, { status: 500 });
    contactsList = (data ?? []) as ContactRow[];
  }

  let templatesList: TemplateRow[] = [];
  if (templateIds.length > 0) {
    const { data, error: templatesError } = await supabase
      .from('email_templates')
      .select('id, subject_template, body_template')
      .in('id', templateIds);
    if (templatesError) return NextResponse.json({ error: templatesError.message }, { status: 500 });
    templatesList = (data ?? []) as TemplateRow[];
  }

  let emailSettingsList: UserEmailSettingsRow[] = [];
  if (userIds.length > 0) {
    const { data, error: settingsError } = await supabase
      .from('user_email_settings')
      .select('user_id, from_email, from_name, brevo_smtp_login, brevo_smtp_key')
      .in('user_id', userIds);
    if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 });
    emailSettingsList = (data ?? []) as UserEmailSettingsRow[];
  }

  const contactsMap = new Map<string, ContactRow>((contactsList ?? []).map((c) => [c.id, c]));
  const templatesMap = new Map<string, TemplateRow>((templatesList ?? []).map((t) => [t.id, t]));
  const settingsMap = new Map<string, UserEmailSettingsRow>((emailSettingsList ?? []).map((s) => [s.user_id, s]));

  const transportersByUserId: Record<string, Transporter> = {};
  const results: { id: string; status: string }[] = [];

  for (const event of emailEvents) {
    const contact = contactsMap.get(event.contact_id);
    const template = templatesMap.get(event.template_id);
    const launchedBy = event.launched_by_user_id;

    if (!contact || !template || !launchedBy) {
      await supabase
        .from('email_events')
        .update({
          status: 'error',
          error_message: !launchedBy ? 'Missing launched_by_user_id' : 'Contact or template not found',
        })
        .eq('id', event.id);
      results.push({ id: event.id, status: 'error' });
      continue;
    }

    const settings = settingsMap.get(launchedBy);
    if (!settings?.brevo_smtp_login || !settings?.brevo_smtp_key || !settings?.from_email) {
      await supabase
        .from('email_events')
        .update({
          status: 'error',
          error_message: 'Missing Brevo SMTP credentials for this user',
        })
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

    if (!contact.email) {
      await supabase
        .from('email_events')
        .update({ status: 'error', error_message: 'Contact has no email' })
        .eq('id', event.id);
      results.push({ id: event.id, status: 'error' });
      continue;
    }

    try {
      let transporter = transportersByUserId[launchedBy];
      if (!transporter) {
        transporter = createBrevoTransporter(settings.brevo_smtp_login, settings.brevo_smtp_key);
        transportersByUserId[launchedBy] = transporter;
      }

      const from =
        settings.from_name && settings.from_name.trim().length > 0
          ? `"${escapeQuotes(settings.from_name)}" <${settings.from_email}>`
          : settings.from_email;

      await sendEmail(
        {
          to: contact.email,
          subject,
          html: body,
          from,
        },
        transporter
      );

      await supabase
        .from('email_events')
        .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
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

  return NextResponse.json({ processed: emailEvents.length, results });
}
