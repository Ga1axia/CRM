-- Enable UUIDs if not already
create extension if not exists "uuid-ossp";

-- CONTACTS
create table if not exists public.contacts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text,
  title text,
  company_name text,
  company_domain text,
  email text,
  linkedin_url text,
  category text, -- buildathon_sponsor, generator_partner, educational_partner, corporate_tool, financial_smb, vc_pitchathon
  tier text, -- e.g. Gold, Silver
  status text, -- not_contacted, contacted, responded, in_discussion, confirmed, declined
  notes text
);

create index if not exists idx_contacts_company_name on public.contacts (company_name);
create index if not exists idx_contacts_category on public.contacts (category);
create index if not exists idx_contacts_status on public.contacts (status);

-- BUCKETS
create table if not exists public.buckets (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  name text not null,
  type text -- optional: same as category or free-form
);

create unique index if not exists idx_buckets_name on public.buckets (name);

-- CONTACT_BUCKETS (many-to-many)
create table if not exists public.contact_buckets (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  contact_id uuid references public.contacts(id) on delete cascade,
  bucket_id uuid references public.buckets(id) on delete cascade
);

create index if not exists idx_contact_buckets_contact_id on public.contact_buckets (contact_id);
create index if not exists idx_contact_buckets_bucket_id on public.contact_buckets (bucket_id);

-- EMAIL_TEMPLATES
create table if not exists public.email_templates (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  name text not null,
  subject_template text not null,
  body_template text not null,
  category text -- optional: corporate_tool, educational_partner, etc.
);

-- EMAIL_SEQUENCES
create table if not exists public.email_sequences (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  name text not null,
  description text,
  category text -- optional
);

-- EMAIL_SEQUENCE_STEPS
create table if not exists public.email_sequence_steps (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  sequence_id uuid references public.email_sequences(id) on delete cascade,
  step_number int not null,
  template_id uuid references public.email_templates(id) on delete cascade,
  delay_days int not null default 0
);

create index if not exists idx_seq_steps_sequence_id on public.email_sequence_steps (sequence_id);
create index if not exists idx_seq_steps_sequence_step on public.email_sequence_steps (sequence_id, step_number);

-- EMAIL_EVENTS
create table if not exists public.email_events (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  contact_id uuid references public.contacts(id) on delete cascade,
  sequence_id uuid references public.email_sequences(id) on delete set null,
  step_number int,
  template_id uuid references public.email_templates(id) on delete set null,
  status text not null default 'queued', -- queued, sent, error
  error_message text,
  sent_at timestamptz,
  scheduled_at timestamptz not null default now()
);

create index if not exists idx_email_events_contact_id on public.email_events (contact_id);
create index if not exists idx_email_events_status_scheduled_at on public.email_events (status, scheduled_at);

-- BASIC TRIGGER TO UPDATE updated_at ON contacts
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_contacts_updated_at on public.contacts;

create trigger set_contacts_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();

-- OPTIONAL: very simple RLS setup (adjust to your auth needs)
alter table public.contacts enable row level security;
alter table public.buckets enable row level security;
alter table public.contact_buckets enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_sequences enable row level security;
alter table public.email_sequence_steps enable row level security;
alter table public.email_events enable row level security;

create policy "Allow all for authenticated" on public.contacts
  for all using (auth.role() = 'authenticated');

create policy "Allow all for authenticated" on public.buckets
  for all using (auth.role() = 'authenticated');

create policy "Allow all for authenticated" on public.contact_buckets
  for all using (auth.role() = 'authenticated');

create policy "Allow all for authenticated" on public.email_templates
  for all using (auth.role() = 'authenticated');

create policy "Allow all for authenticated" on public.email_sequences
  for all using (auth.role() = 'authenticated');

create policy "Allow all for authenticated" on public.email_sequence_steps
  for all using (auth.role() = 'authenticated');

create policy "Allow all for authenticated" on public.email_events
  for all using (auth.role() = 'authenticated');

-- USER EMAIL SETTINGS (per-user Brevo SMTP: users add their own Brevo API/SMTP keys)
-- If you had an older Gmail-based version of this table, run: DROP TABLE IF EXISTS public.user_email_settings;
create table if not exists public.user_email_settings (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_email text not null,
  from_name text,
  brevo_smtp_login text not null,
  brevo_smtp_key text not null,
  unique(user_id)
);

create index if not exists idx_user_email_settings_user_id on public.user_email_settings (user_id);

alter table public.user_email_settings enable row level security;

create policy "Users can manage own email settings" on public.user_email_settings
  for all using (auth.uid() = user_id);
