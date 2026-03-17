'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Contact } from '@/lib/types';

type Props = {
  companyName: string;
  contacts: Contact[];
};

export default function CompanyView({ companyName, contacts }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          title: title || null,
          company_name: companyName,
          email: email || null,
          status: 'not_contacted',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to add');
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/contacts"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Contacts
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
          {companyName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setShowAdd(!showAdd)}
        className="mb-4 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add new contact for this company
      </button>
      {showAdd && (
        <form onSubmit={handleAdd} className="mb-6 p-4 border rounded-lg dark:border-gray-700 space-y-2 max-w-md">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Adding…' : 'Add contact'}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 border rounded-md dark:border-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Name</th>
              <th className="px-4 py-2 text-left font-medium">Title</th>
              <th className="px-4 py-2 text-left font-medium">Email</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No contacts for this company.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2">
                    <Link
                      href="/contacts"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {c.name ?? '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{c.title ?? '—'}</td>
                  <td className="px-4 py-2">{c.email ?? '—'}</td>
                  <td className="px-4 py-2">{c.status ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
