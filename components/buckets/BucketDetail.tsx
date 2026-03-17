'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Bucket } from '@/lib/types';

type ContactStub = { id: string; name: string | null; email: string | null; company_name: string | null };

type Props = {
  bucket: Bucket;
  contactsInBucket: ContactStub[];
  allContacts: ContactStub[];
};

export default function BucketDetail({ bucket, contactsInBucket, allContacts }: Props) {
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function addContact() {
    if (!selectedId) return;
    setRefreshing(true);
    try {
      await fetch(`/api/buckets/${bucket.id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: selectedId }),
      });
      window.location.reload();
    } finally {
      setRefreshing(false);
      setAdding(false);
      setSelectedId('');
    }
  }

  async function removeContact(contactId: string) {
    setRefreshing(true);
    try {
      await fetch(`/api/buckets/${bucket.id}/contacts/${contactId}`, { method: 'DELETE' });
      window.location.reload();
    } finally {
      setRefreshing(false);
    }
  }

  const alreadyInBucket = new Set(contactsInBucket.map((c) => c.id));
  const availableContacts = allContacts.filter((c) => !alreadyInBucket.has(c.id));

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/buckets"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Buckets
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {bucket.name}
        </h1>
        {bucket.type && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{bucket.type}</span>
        )}
      </div>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setAdding(!adding)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add existing contact
        </button>
        {adding && (
          <div className="mt-2 flex gap-2 items-center">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="px-3 py-1.5 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">Select contact…</option>
              {availableContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ?? c.email ?? c.id}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addContact}
              disabled={!selectedId || refreshing}
              className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        )}
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Name</th>
              <th className="px-4 py-2 text-left font-medium">Company</th>
              <th className="px-4 py-2 text-left font-medium">Email</th>
              <th className="px-4 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {contactsInBucket.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No contacts in this bucket.
                </td>
              </tr>
            ) : (
              contactsInBucket.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2">
                    <Link
                      href={`/contacts`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {c.name ?? '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{c.company_name ?? '—'}</td>
                  <td className="px-4 py-2">{c.email ?? '—'}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => removeContact(c.id)}
                      className="text-red-600 dark:text-red-400 hover:underline text-sm"
                    >
                      Remove
                    </button>
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
