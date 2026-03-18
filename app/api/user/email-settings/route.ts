import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('user_email_settings')
    .select('from_email, from_name, brevo_smtp_login')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    from_email: data?.from_email ?? null,
    from_name: data?.from_name ?? null,
    brevo_smtp_login: data?.brevo_smtp_login ?? null,
    has_credentials: !!data,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const from_email = typeof body.from_email === 'string' ? body.from_email.trim() : '';
  const from_name = typeof body.from_name === 'string' ? body.from_name.trim() : null;
  const brevo_smtp_login = typeof body.brevo_smtp_login === 'string' ? body.brevo_smtp_login.trim() : '';
  const brevo_smtp_key = typeof body.brevo_smtp_key === 'string' ? body.brevo_smtp_key.trim() : '';

  if (!from_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from_email)) {
    return NextResponse.json({ error: 'A valid From email is required.' }, { status: 400 });
  }
  if (!brevo_smtp_login) {
    return NextResponse.json({ error: 'Brevo SMTP login is required (e.g. xxx@smtp-brevo.com).' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data: existing } = await supabase
    .from('user_email_settings')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!existing && !brevo_smtp_key) {
    return NextResponse.json({ error: 'Brevo SMTP key is required for first-time setup.' }, { status: 400 });
  }

  const updated_at = new Date().toISOString();

  if (existing) {
    const update: { from_email: string; from_name: string | null; updated_at: string; brevo_smtp_login?: string; brevo_smtp_key?: string } = {
      from_email,
      from_name: from_name || null,
      updated_at,
    };
    if (brevo_smtp_key) {
      update.brevo_smtp_login = brevo_smtp_login;
      update.brevo_smtp_key = brevo_smtp_key;
    }
    const { error } = await supabase
      .from('user_email_settings')
      .update(update)
      .eq('user_id', user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase.from('user_email_settings').insert({
      user_id: user.id,
      from_email,
      from_name: from_name || null,
      brevo_smtp_login,
      brevo_smtp_key,
      updated_at,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, from_email });
}
