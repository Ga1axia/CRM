import { createClient } from '@supabase/supabase-js';

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  return createClient(url!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
