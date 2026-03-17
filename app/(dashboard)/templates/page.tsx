import { supabaseServer } from '@/lib/supabase/serverClient';
import Link from 'next/link';
import TemplateForm from '@/components/email/TemplateForm';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ edit?: string }> };

export default async function TemplatesPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = supabaseServer();
  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Email templates</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage subject and body templates with &#123;&#123;name&#125;&#125; and &#123;&#123;company&#125;&#125; placeholders.</p>
      </div>
      <div className="mb-6">
        <TemplateForm templateId={params.edit} />
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
              <th className="px-5 py-3.5 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
              <th className="px-5 py-3.5 text-left font-semibold text-gray-700 dark:text-gray-300">Category</th>
              <th className="px-5 py-3.5 text-left font-semibold text-gray-700 dark:text-gray-300">Subject</th>
              <th className="px-5 py-3.5 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {(templates ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  No templates yet.
                </td>
              </tr>
            ) : (
              (templates ?? []).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{t.name}</td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{t.category ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 truncate max-w-xs">{t.subject_template}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/templates?edit=${t.id}`}
                      className="text-[var(--accent)] hover:underline font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
