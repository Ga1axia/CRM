'use client';

type Variant =
  | 'not_contacted'
  | 'contacted'
  | 'responded'
  | 'in_discussion'
  | 'confirmed'
  | 'declined'
  | 'active'
  | 'queued'
  | 'sent'
  | 'error'
  | 'category'
  | 'default';

const VARIANT_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  not_contacted: { dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-700', text: '' },
  contacted: { dot: 'bg-blue-500', bg: 'bg-blue-50 text-blue-700', text: '' },
  responded: { dot: 'bg-violet-500', bg: 'bg-violet-50 text-violet-700', text: '' },
  in_discussion: { dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-800', text: '' },
  confirmed: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700', text: '' },
  declined: { dot: 'bg-gray-500', bg: 'bg-gray-100 text-gray-700', text: '' },
  active: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700', text: '' },
  queued: { dot: 'bg-indigo-500', bg: 'bg-indigo-50 text-indigo-700', text: '' },
  sent: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700', text: '' },
  error: { dot: 'bg-red-500', bg: 'bg-red-50 text-red-700', text: '' },
  category: { dot: 'bg-violet-500', bg: 'bg-violet-50 text-violet-700', text: '' },
  default: { dot: 'bg-gray-400', bg: 'bg-gray-100 text-gray-700', text: '' },
};

function getVariant(value: string | null | undefined): Variant {
  if (!value) return 'default';
  const v = value.toLowerCase().replace(/\s+/g, '_');
  if (VARIANT_STYLES[v]) return v as Variant;
  if (v === 'not_contacted' || v === 'contacted' || v === 'responded' || v === 'in_discussion' || v === 'confirmed' || v === 'declined') return v as Variant;
  if (v === 'queued' || v === 'sent' || v === 'error') return v as Variant;
  return 'category';
}

type Props = {
  value: string | null | undefined;
  variant?: Variant;
  label?: string;
};

export default function StatusTag({ value, variant, label }: Props) {
  const display = label ?? (value ? value.replace(/_/g, ' ') : '—');
  const v = variant ?? getVariant(value);
  const style = VARIANT_STYLES[v] ?? VARIANT_STYLES.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {display}
    </span>
  );
}
