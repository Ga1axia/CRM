'use client';

import { useState, useEffect } from 'react';

type Step = { step_number: number; template_id: string; delay_days: number };
type Props = {
  sequenceId: string;
  initialSteps: { id: string; step_number: number; template_id: string; delay_days: number }[];
  templates: { id: string; name: string }[];
  onSaved?: () => void;
};

export default function SequenceBuilder({ sequenceId, initialSteps, templates, onSaved }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<Step[]>(
    initialSteps.map((s) => ({
      step_number: s.step_number,
      template_id: s.template_id,
      delay_days: s.delay_days ?? 0,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/email-sequences/${sequenceId}`)
      .then((res) => res.json())
      .then((seq) => {
        setName(seq.name ?? '');
        setDescription(seq.description ?? '');
      })
      .catch(() => {});
  }, [sequenceId]);

  function addStep() {
    const nextNum = steps.length ? Math.max(...steps.map((s) => s.step_number)) + 1 : 1;
    setSteps([...steps, { step_number: nextNum, template_id: templates[0]?.id ?? '', delay_days: 0 }]);
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index));
  }

  function updateStep(index: number, field: keyof Step, value: number | string) {
    const next = [...steps];
    (next[index] as Record<string, unknown>)[field] = value;
    setSteps(next);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/email-sequences/${sequenceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          description: description || undefined,
          steps: steps.map((s, i) => ({
            step_number: i + 1,
            template_id: s.template_id,
            delay_days: s.delay_days ?? 0,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? res.statusText);
      }
      onSaved?.();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mb-8 p-4 border rounded-lg dark:border-gray-700 space-y-4">
      <h2 className="font-medium text-gray-900 dark:text-white">Edit sequence</h2>
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
        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Steps</label>
          <button type="button" onClick={addStep} className="text-sm text-blue-600 dark:text-blue-400">
            + Add step
          </button>
        </div>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-2 items-center flex-wrap">
              <span className="text-sm text-gray-500">Step {i + 1}</span>
              <select
                value={s.template_id}
                onChange={(e) => updateStep(i, 'template_id', e.target.value)}
                className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={s.delay_days}
                onChange={(e) => updateStep(i, 'delay_days', parseInt(e.target.value, 10) || 0)}
                className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
              />
              <span className="text-xs text-gray-500">days delay</span>
              <button type="button" onClick={() => removeStep(i)} className="text-red-600 text-sm">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save sequence'}
      </button>
    </form>
  );
}
