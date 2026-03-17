import { supabaseServer } from '@/lib/supabase/serverClient';
import Link from 'next/link';
import NewSequenceForm from '@/components/email/NewSequenceForm';

export const dynamic = 'force-dynamic';

export default async function SequencesPage() {
  const supabase = supabaseServer();
  const { data: sequences } = await supabase
    .from('email_sequences')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Email sequences</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Multi-step email flows with templates and delays.</p>
      </div>
      <div className="mb-6">
        <NewSequenceForm />
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {(sequences ?? []).length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">No sequences yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {(sequences ?? []).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sequences/${s.id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{s.name}</span>
                  {s.description && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      — {s.description}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
