/**
 * One-time script to create the two sign-in accounts in Supabase Auth.
 * Run: node --env-file=.env.local scripts/seed-auth-users.mjs
 * (Or: npm run seed:users — after setting env in .env.local)
 *
 * Default password for both: GeneratorCRM1!
 * Users should change it after first login.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local from project root
const envPath = resolve(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[match[1].trim()] = value;
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const DEFAULT_PASSWORD = 'GeneratorCRM1!';

const accounts = [
  { email: 'vgardner1@babson.edu', label: 'account1' },
  { email: 'etran2@babson.edu', label: 'account2' },
];

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  for (const { email, label } of accounts) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });
      if (error) {
        if (error.message?.includes('already been registered')) {
          console.log(`  ${label} (${email}): already exists, skipped.`);
        } else {
          console.error(`  ${label} (${email}): ${error.message}`);
        }
      } else {
        console.log(`  ${label} (${email}): created.`);
      }
    } catch (err) {
      console.error(`  ${label} (${email}):`, err.message);
    }
  }
  console.log('\nDefault password for both: ' + DEFAULT_PASSWORD);
  console.log('Change it after first login in Supabase Dashboard or via your app.');
}

main();
