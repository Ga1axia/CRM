'use client';

import { useState, useEffect } from 'react';
import { CONTACT_CATEGORIES, CONTACT_STATUSES } from '@/lib/types';
import type { Bucket } from '@/lib/types';

type Props = {
  onClose: () => void;
  onLaunched?: () => void;
  buckets: Pick<Bucket, 'id' | 'name'>[];
};

type Sequence = { id: string; name: string };

export default function LaunchSequenceModal({ onClose, onLaunched, buckets }: Props) {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [sequenceId, setSequenceId] = useState('');
  const [category, setCategory] = useState('');
  const [bucketId, setBucketId] = useState('');
  const [status, setStatus] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/email-sequences')
      .then((res) => res.json())
      .then((data) => setSequences(Array.isArray(data) ? data : []))
      .catch(() => setSequences([]));
  }, []);

  async function fetchCount() {
    setLoadingCount(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (bucketId) params.set('bucketId', bucketId);
      if (status) params.set('status', status);
      const res = await fetch(`/api/contacts?${params}&pageSize=500`);
      const json = await res.json();
      setCount(json.totalCount ?? json.data?.length ?? 0);
    } catch {
      setCount(null);
    } finally {
      setLoadingCount(false);
    }
  }

  async function handleLaunch() {
    if (!sequenceId) return;
    setLaunching(true);
    setError(null);
    try {
      const res = await fetch(`/api/email-sequences/${sequenceId}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: category || undefined, bucketId: bucketId || undefined, status: status || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      onLaunched?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Launch failed');
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Launch email sequence</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        <div className="p-4 space-y-3">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Sequence</label>
            <select
              value={sequenceId}
              onChange={(e) => setSequenceId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">Select sequence…</option>
              {sequences.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">All</option>
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
              <option value="">All</option>
              {CONTACT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bucket</label>
            <select
              value={bucketId}
              onChange={(e) => setBucketId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">All</option>
              {buckets.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={fetchCount}
              disabled={loadingCount}
              className="px-3 py-1.5 text-sm border rounded-md dark:border-gray-600"
            >
              {loadingCount ? '…' : 'Count contacts'}
            </button>
            {count != null && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {count} contacts match
              </span>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleLaunch}
              disabled={!sequenceId || launching}
              className="btn-primary"
            >
              {launching ? 'Launching…' : 'Launch'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
