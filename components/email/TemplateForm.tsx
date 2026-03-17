'use client';

import { useState, useEffect } from 'react';
import type { EmailTemplate } from '@/lib/types';

type Props = {
  templateId?: string | null;
  onSaved?: () => void;
};

export default function TemplateForm({ templateId, onSaved }: Props) {
  const [name, setName] = useState('');
  const [subject_template, setSubjectTemplate] = useState('');
  const [body_template, setBodyTemplate] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(!!templateId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    fetch(`/api/email-templates/${templateId}`)
      .then((res) => res.json())
      .then((t: EmailTemplate) => {
        setName(t.name ?? '');
        setSubjectTemplate(t.subject_template ?? '');
        setBodyTemplate(t.body_template ?? '');
        setCategory(t.category ?? '');
      })
      .finally(() => setLoading(false));
  }, [templateId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = { name, subject_template, body_template, category: category || null };
      const url = templateId ? `/api/email-templates/${templateId}` : '/api/email-templates';
      const method = templateId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? res.statusText);
      }
      setName('');
      setSubjectTemplate('');
      setBodyTemplate('');
      setCategory('');
      onSaved?.();
      if (!templateId) window.location.reload();
      else window.location.href = '/templates';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4 max-w-2xl">
      <h2 className="font-medium text-gray-900 dark:text-white">
        {templateId ? 'Edit template' : 'New template'}
      </h2>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          placeholder="e.g. Tool Sponsor – Initial Outreach"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Subject (use &#123;&#123;name&#125;&#125;, &#123;&#123;company&#125;&#125;)</label>
        <input
          value={subject_template}
          onChange={(e) => setSubjectTemplate(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Body (HTML, use &#123;&#123;name&#125;&#125;, &#123;&#123;company&#125;&#125;)</label>
        <textarea
          value={body_template}
          onChange={(e) => setBodyTemplate(e.target.value)}
          required
          rows={6}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 font-mono text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category (optional)</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="btn-primary"
      >
        {saving ? 'Saving…' : templateId ? 'Update' : 'Create'}
      </button>
    </form>
  );
}
