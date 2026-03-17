'use client';

import { useState, useCallback } from 'react';
import { CONTACT_STATUSES } from '@/lib/types';
import type { Contact } from '@/lib/types';
import StatusTag from '@/components/ui/StatusTag';

type ContactRow = Contact & {
  contact_buckets?: { buckets: { id: string; name: string } | null }[];
};

type Props = {
  initialContacts: ContactRow[];
};

export default function PipelineBoard({ initialContacts }: Props) {
  const [contacts, setContacts] = useState<ContactRow[]>(initialContacts);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string | null>(null);

  const grouped = CONTACT_STATUSES.reduce(
    (acc, status) => {
      acc[status] = contacts.filter((c) => (c.status ?? 'not_contacted') === status);
      return acc;
    },
    {} as Record<string, ContactRow[]>
  );

  const updateStatus = useCallback(async (contactId: string, newStatus: string) => {
    const res = await fetch(`/api/contacts/${contactId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, ...updated } : c))
    );
  }, []);

  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    setDraggedId(contactId);
    e.dataTransfer.setData('text/plain', contactId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setTargetStatus(status);
  };

  const handleDragLeave = () => setTargetStatus(null);

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setTargetStatus(null);
    const contactId = e.dataTransfer.getData('text/plain');
    if (contactId) updateStatus(contactId, status);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setTargetStatus(null);
  };

  const bucketChips = (c: ContactRow) =>
    c.contact_buckets
      ?.map((cb) => cb.buckets?.name)
      .filter(Boolean)
      .slice(0, 2) ?? [];

  return (
    <div className="flex gap-5 overflow-x-auto pb-6">
      {CONTACT_STATUSES.map((status) => (
        <div
          key={status}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
          className={`flex-shrink-0 w-72 rounded-xl border-2 p-3 min-h-[420px] transition-colors ${
            targetStatus === status
              ? 'border-[var(--accent)] bg-violet-50/50 dark:bg-violet-950/20'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 capitalize">
              {status.replace(/_/g, ' ')}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {grouped[status]?.length ?? 0}
            </span>
          </div>
          <div className="space-y-3">
            {grouped[status]?.map((c) => (
              <div
                key={c.id}
                draggable
                onDragStart={(e) => handleDragStart(e, c.id)}
                onDragEnd={handleDragEnd}
                className={`rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing overflow-hidden transition-opacity ${
                  draggedId === c.id ? 'opacity-50' : ''
                }`}
              >
                <div className="px-3 pt-2.5 pb-1">
                  <StatusTag value={c.status} />
                </div>
                <div className="px-3 pb-3 pt-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                    {c.name ?? 'Unnamed'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {c.title ?? '—'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                    {c.company_name ?? '—'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bucketChips(c).map((name) => (
                      <span
                        key={name}
                        className="inline-block px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
