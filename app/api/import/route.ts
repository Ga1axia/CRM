import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase/serverClient';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const COL_MAP: Record<string, string> = {
  name: 'name',
  title: 'title',
  company: 'company_name',
  company_name: 'company_name',
  email: 'email',
  linkedin: 'linkedin_url',
  linkedin_url: 'linkedin_url',
  category: 'category',
  tier: 'tier',
  status: 'status',
  notes: 'notes',
};

function normalizeKey(k: string): string {
  const lower = k.trim().toLowerCase().replace(/\s+/g, '_');
  return COL_MAP[lower] ?? lower;
}

function rowToContact(row: Record<string, unknown>): Record<string, unknown> {
  const contact: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const v = value == null || value === '' ? null : String(value).trim();
    const field = normalizeKey(key);
    if (['name', 'title', 'company_name', 'company_domain', 'email', 'linkedin_url', 'category', 'tier', 'status', 'notes'].includes(field)) {
      contact[field] = v;
    }
  }
  if (!contact.status) contact.status = 'not_contacted';
  return contact;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') ?? '';
  let rows: Record<string, unknown>[] = [];

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = (file.name || '').toLowerCase();

    if (name.endsWith('.csv')) {
      const text = buffer.toString('utf-8');
      const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
      rows = parsed.data as Record<string, unknown>[];
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Use CSV or XLSX.' }, { status: 400 });
    }
  } else if (contentType.includes('application/json')) {
    const body = await req.json();
    rows = Array.isArray(body) ? body : body.rows ?? [];
  } else {
    return NextResponse.json({ error: 'Send multipart form with file or JSON array' }, { status: 400 });
  }

  const contacts = rows
    .filter((r) => Object.keys(r).length > 0)
    .map(rowToContact)
    .filter((c) => c.name || c.email || c.company_name);

  if (contacts.length === 0) {
    return NextResponse.json({ imported: 0, error: 'No valid rows' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase.from('contacts').insert(contacts).select('id');
  if (error) return NextResponse.json({ error: error.message, imported: 0 }, { status: 500 });
  return NextResponse.json({ imported: data?.length ?? contacts.length });
}
