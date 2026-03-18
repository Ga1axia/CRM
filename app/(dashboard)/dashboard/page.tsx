'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Stats = {
  contacts: number;
  contactsByStatus: Record<string, number>;
  sequences: number;
  templates: number;
  buckets: number;
  recentEvents: Array<{
    id: string;
    status: string;
    sent_at: string | null;
    scheduled_at: string;
    contact?: { name?: string; email?: string; company_name?: string };
    sequence?: { name?: string };
  }>;
};

function StatCard({
  title,
  value,
  href,
  subtitle,
}: {
  title: string;
  value: number | string;
  href?: string;
  subtitle?: string;
}) {
  const content = (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
  );
  if (href) {
    return <Link href={href} className="block hover:opacity-90 transition-opacity">{content}</Link>;
  }
  return content;
}

function statusLabel(s: string): string {
  const labels: Record<string, string> = {
    not_contacted: 'Not contacted',
    contacted: 'Contacted',
    responded: 'Responded',
    in_discussion: 'In discussion',
    confirmed: 'Confirmed',
    declined: 'Declined',
    queued: 'Queued',
    sent: 'Sent',
    error: 'Error',
  };
  return labels[s] ?? s;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.contacts !== undefined) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Loading stats…</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Could not load stats.</p>
      </div>
    );
  }

  const statusEntries = Object.entries(stats.contactsByStatus).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your CRM data and recent email activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Contacts" value={stats.contacts} href="/contacts" />
        <StatCard title="Sequences" value={stats.sequences} href="/sequences" />
        <StatCard title="Templates" value={stats.templates} href="/templates" />
        <StatCard title="Buckets" value={stats.buckets} href="/buckets" />
      </div>

      {statusEntries.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Contacts by status</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pipeline breakdown</p>
          </div>
          <div className="p-5 flex flex-wrap gap-3">
            {statusEntries.map(([status, count]) => (
              <Link
                key={status}
                href={`/contacts?status=${encodeURIComponent(status)}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
              >
                <span>{statusLabel(status)}</span>
                <span className="font-semibold">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {stats.recentEvents.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent email activity</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Latest sequence events</p>
            </div>
            <Link
              href="/sequences"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View sequences
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-5 font-medium text-gray-500 dark:text-gray-400">Contact</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 dark:text-gray-400">Sequence</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-5 font-medium text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEvents.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3 px-5 text-gray-900 dark:text-white">
                      {e.contact?.name ?? e.contact?.email ?? '—'}
                    </td>
                    <td className="py-3 px-5 text-gray-600 dark:text-gray-300">
                      {e.sequence?.name ?? '—'}
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          e.status === 'sent'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : e.status === 'error'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {statusLabel(e.status)}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-gray-500 dark:text-gray-400">
                      {e.sent_at
                        ? new Date(e.sent_at).toLocaleString()
                        : new Date(e.scheduled_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.recentEvents.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No email activity yet. Launch a sequence from Contacts to get started.</p>
          <Link href="/contacts" className="mt-3 inline-block text-[var(--accent)] font-medium hover:underline">
            Go to Contacts
          </Link>
        </div>
      )}
    </div>
  );
}
