'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewSequenceForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/email-sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      if (!res.ok) throw new Error(await res.text());
      const seq = await res.json();
      router.push(`/sequences/${seq.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-wrap">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tool Sponsor 2-step"
          className="px-3 py-1.5 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          className="px-3 py-1.5 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
      >
        {saving ? 'Creating…' : 'New sequence'}
      </button>
    </form>
  );
}
