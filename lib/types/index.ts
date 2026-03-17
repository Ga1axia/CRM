export type ContactCategory =
  | 'buildathon_sponsor'
  | 'generator_partner'
  | 'educational_partner'
  | 'corporate_tool'
  | 'financial_smb'
  | 'vc_pitchathon';

export type ContactStatus =
  | 'not_contacted'
  | 'contacted'
  | 'responded'
  | 'in_discussion'
  | 'confirmed'
  | 'declined';

export type EmailEventStatus = 'queued' | 'sent' | 'error';

export interface Contact {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  title: string | null;
  company_name: string | null;
  company_domain: string | null;
  email: string | null;
  linkedin_url: string | null;
  category: ContactCategory | string | null;
  tier: string | null;
  status: ContactStatus | string | null;
  notes: string | null;
}

export interface Bucket {
  id: string;
  created_at: string;
  name: string;
  type: string | null;
}

export interface ContactBucket {
  id: string;
  created_at: string;
  contact_id: string;
  bucket_id: string;
}

export interface ContactWithBuckets extends Contact {
  contact_buckets?: { bucket_id: string; buckets: Bucket | null }[];
}

export interface EmailTemplate {
  id: string;
  created_at: string;
  name: string;
  subject_template: string;
  body_template: string;
  category: string | null;
}

export interface EmailSequence {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  category: string | null;
}

export interface EmailSequenceStep {
  id: string;
  created_at: string;
  sequence_id: string;
  step_number: number;
  template_id: string;
  delay_days: number;
}

export interface EmailEvent {
  id: string;
  created_at: string;
  contact_id: string;
  sequence_id: string | null;
  step_number: number | null;
  template_id: string | null;
  status: EmailEventStatus;
  error_message: string | null;
  sent_at: string | null;
  scheduled_at: string;
}

export const CONTACT_CATEGORIES: ContactCategory[] = [
  'buildathon_sponsor',
  'generator_partner',
  'educational_partner',
  'corporate_tool',
  'financial_smb',
  'vc_pitchathon',
];

export const CONTACT_STATUSES: ContactStatus[] = [
  'not_contacted',
  'contacted',
  'responded',
  'in_discussion',
  'confirmed',
  'declined',
];

export const EMAIL_EVENT_STATUSES: EmailEventStatus[] = ['queued', 'sent', 'error'];
