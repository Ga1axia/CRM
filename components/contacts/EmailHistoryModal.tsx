'use client';

import { useState, useEffect } from 'react';
import type { EmailEvent } from '@/lib/types';
import StatusTag from '@/components/ui/StatusTag';

type Props = {
  contactId: string;
  onClose: () => void;
};

export default function EmailHistoryModal({ contactId, onClose }: Props) {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contacts/${contactId}/email-events`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [contactId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Email history</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        <div className="p-4 overflow-auto flex-1">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500">No email events yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-400">
                  <th className="pb-2">Step</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Scheduled</th>
                  <th className="pb-2">Sent</th>
                  <th className="pb-2">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {events.map((e) => (
                  <tr key={e.id}>
                    <td className="py-1">{e.step_number ?? '—'}</td>
                    <td className="py-1"><StatusTag value={e.status} variant={e.status === 'sent' ? 'sent' : e.status === 'error' ? 'error' : 'queued'} /></td>
                    <td className="py-1">{e.scheduled_at ? new Date(e.scheduled_at).toLocaleString() : '—'}</td>
                    <td className="py-1">{e.sent_at ? new Date(e.sent_at).toLocaleString() : '—'}</td>
                    <td className="py-1 text-red-600 dark:text-red-400">{e.error_message ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
