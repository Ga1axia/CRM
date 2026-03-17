'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { EmailSequence } from '@/lib/types';
import StatusTag from '@/components/ui/StatusTag';

type StepRow = { id: string; step_number: number; delay_days: number; template_id: string; email_templates: { id: string; name: string; subject_template: string } | null };
type EventRow = {
  id: string;
  contact_id: string;
  step_number: number | null;
  status: string;
  scheduled_at: string;
  sent_at: string | null;
  error_message: string | null;
  contacts: { id: string; name: string | null; email: string | null; company_name: string | null } | null;
};

type Props = {
  sequence: EmailSequence;
  steps: StepRow[];
  events: EventRow[];
  stats: { total: number; sent: number; error: number; queued: number };
};

export default function SequenceMonitor({ sequence, steps, events, stats }: Props) {
  const [runningSendDue, setRunningSendDue] = useState(false);

  async function runSendDue() {
    setRunningSendDue(true);
    try {
      await fetch('/api/email/send-due', { method: 'POST' });
      window.location.reload();
    } finally {
      setRunningSendDue(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Link href="/sequences" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Sequences
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{sequence.name}</h1>
      </div>
      {sequence.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">{sequence.description}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total enrolled</p>
          <p className="text-lg font-medium">{stats.total}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Sent</p>
          <p className="text-lg font-medium text-green-600 dark:text-green-400">{stats.sent}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Queued</p>
          <p className="text-lg font-medium text-blue-600 dark:text-blue-400">{stats.queued}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Errors</p>
          <p className="text-lg font-medium text-red-600 dark:text-red-400">{stats.error}</p>
        </div>
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={runSendDue}
          disabled={runningSendDue}
          className="btn-primary"
        >
          {runningSendDue ? 'Running…' : 'Run due emails'}
        </button>
      </div>

      <h2 className="font-medium text-gray-900 dark:text-white mb-2">Steps</h2>
      <ul className="list-disc list-inside mb-6 text-sm text-gray-600 dark:text-gray-400">
        {steps.map((s) => (
          <li key={s.id}>
            Step {s.step_number}: {s.email_templates?.name ?? '—'} (delay {s.delay_days} days)
          </li>
        ))}
      </ul>

      <h2 className="font-medium text-gray-900 dark:text-white mb-2">Recent events</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Contact</th>
              <th className="px-4 py-2 text-left font-medium">Step</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Scheduled</th>
              <th className="px-4 py-2 text-left font-medium">Sent</th>
              <th className="px-4 py-2 text-left font-medium">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No events yet.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2">
                    {e.contacts?.name ?? e.contacts?.email ?? e.contact_id}
                  </td>
                  <td className="px-4 py-2">{e.step_number ?? '—'}</td>
                  <td className="px-4 py-2"><StatusTag value={e.status} variant={e.status === 'sent' ? 'sent' : e.status === 'error' ? 'error' : 'queued'} /></td>
                  <td className="px-4 py-2">
                    {e.scheduled_at ? new Date(e.scheduled_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {e.sent_at ? new Date(e.sent_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-2 text-red-600 dark:text-red-400">
                    {e.error_message ?? '—'}
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
