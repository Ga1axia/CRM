'use client';

import { useState, useCallback } from 'react';
import type { Contact, Bucket } from '@/lib/types';
import StatusTag from '@/components/ui/StatusTag';
import EditContactModal from './EditContactModal';
import EmailHistoryModal from './EmailHistoryModal';

type ContactRow = Contact & {
  contact_buckets?: { bucket_id: string; buckets: { id: string; name: string } | null }[];
};

type Props = {
  initialContacts: ContactRow[];
  buckets: Pick<Bucket, 'id' | 'name'>[];
  filters?: { status?: string; category?: string; bucketId?: string; search?: string; page?: number; pageSize?: number };
  totalCount?: number;
  onRefresh?: () => void;
};

function EllipsisIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

export default function ContactsTable({
  initialContacts,
  buckets,
  filters = {},
  totalCount,
  onRefresh,
}: Props) {
  const [contacts, setContacts] = useState<ContactRow[]>(initialContacts);
  const [editingContact, setEditingContact] = useState<ContactRow | null>(null);
  const [emailHistoryContactId, setEmailHistoryContactId] = useState<string | null>(null);
  const [rowMenuId, setRowMenuId] = useState<string | null>(null);

  const handleContactUpdated = useCallback(
    (updated: Contact) => {
      setContacts((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      setEditingContact(null);
      setRowMenuId(null);
      onRefresh?.();
    },
    [onRefresh]
  );

  const bucketNames = (c: ContactRow) =>
    c.contact_buckets
      ?.map((cb) => cb.buckets?.name)
      .filter(Boolean)
      .join(', ') ?? '';

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
                <th className="px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">Title</th>
                <th className="px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">Company</th>
                <th className="px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">Category</th>
                <th className="px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">Buckets</th>
                <th className="px-5 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  className="bg-white dark:bg-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                    {c.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{c.title ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{c.company_name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{c.email ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <StatusTag value={c.category} variant="category" label={c.category ? c.category.replace(/_/g, ' ') : undefined} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusTag value={c.status} />
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                    {bucketNames(c) || '—'}
                  </td>
                  <td className="px-5 py-3.5 relative">
                    <button
                      type="button"
                      onClick={() => setRowMenuId(rowMenuId === c.id ? null : c.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label="Actions"
                    >
                      <EllipsisIcon />
                    </button>
                    {rowMenuId === c.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setRowMenuId(null)} />
                        <div className="absolute right-0 top-full mt-1 z-20 py-1 w-44 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                          <button
                            type="button"
                            onClick={() => { setEditingContact(c); setRowMenuId(null); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEmailHistoryContactId(c.id); setRowMenuId(null); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Email history
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totalCount != null && totalCount > (filters.pageSize ?? 20) && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Showing {contacts.length} of {totalCount} contacts
        </p>
      )}
      {editingContact && (
        <EditContactModal
          contact={editingContact}
          buckets={buckets}
          onClose={() => setEditingContact(null)}
          onSaved={handleContactUpdated}
        />
      )}
      {emailHistoryContactId && (
        <EmailHistoryModal
          contactId={emailHistoryContactId}
          onClose={() => setEmailHistoryContactId(null)}
        />
      )}
    </>
  );
}
