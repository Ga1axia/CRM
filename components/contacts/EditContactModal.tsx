'use client';

import { useState } from 'react';
import type { Contact, Bucket } from '@/lib/types';
import { CONTACT_CATEGORIES, CONTACT_STATUSES } from '@/lib/types';

type ContactRow = Contact & {
  contact_buckets?: { bucket_id: string }[];
};

type Props = {
  contact: ContactRow;
  buckets: Pick<Bucket, 'id' | 'name'>[];
  onClose: () => void;
  onSaved: (contact: Contact) => void;
};

export default function EditContactModal({ contact, buckets, onClose, onSaved }: Props) {
  const [name, setName] = useState(contact.name ?? '');
  const [title, setTitle] = useState(contact.title ?? '');
  const [company_name, setCompanyName] = useState(contact.company_name ?? '');
  const [email, setEmail] = useState(contact.email ?? '');
  const [category, setCategory] = useState(contact.category ?? '');
  const [status, setStatus] = useState(contact.status ?? '');
  const [notes, setNotes] = useState(contact.notes ?? '');
  const [bucketIds, setBucketIds] = useState<string[]>(
    contact.contact_buckets?.map((cb) => cb.bucket_id) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          title: title || null,
          company_name: company_name || null,
          company_domain: contact.company_domain ?? null,
          email: email || null,
          linkedin_url: contact.linkedin_url ?? null,
          category: category || null,
          tier: contact.tier ?? null,
          status: status || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? res.statusText);
      }
      const updated = await res.json();
      await updateContactBuckets(contact.id, bucketIds);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function updateContactBuckets(contactId: string, newBucketIds: string[]) {
    const existing = contact.contact_buckets?.map((cb) => cb.bucket_id) ?? [];
    const toAdd = newBucketIds.filter((id) => !existing.includes(id));
    const toRemove = existing.filter((id) => !newBucketIds.includes(id));
    for (const bucketId of toAdd) {
      await fetch(`/api/buckets/${bucketId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId }),
      });
    }
    for (const bucketId of toRemove) {
      await fetch(`/api/buckets/${bucketId}/contacts/${contactId}`, { method: 'DELETE' });
    }
  }

  function toggleBucket(id: string) {
    setBucketIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit contact</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
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
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              value={company_name}
              onChange={(e) => setCompanyName(e.target.value)}
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
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">—</option>
              {CONTACT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">—</option>
              {CONTACT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Buckets</label>
            <div className="flex flex-wrap gap-2">
              {buckets.map((b) => (
                <label key={b.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={bucketIds.includes(b.id)}
                    onChange={() => toggleBucket(b.id)}
                  />
                  <span>{b.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
