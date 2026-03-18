'use client';

import { useState } from 'react';

type Step = { step_number: number; template_id: string; delay_days: number };
type StepInput = { id?: string; step_number: number; template_id: string; delay_days: number };
type Props = {
  sequenceId: string;
  initialName: string;
  initialDescription: string;
  initialSteps: StepInput[];
  templates: { id: string; name: string }[];
  onSaved?: () => void;
};

export default function SequenceBuilder({
  sequenceId,
  initialName,
  initialDescription,
  initialSteps,
  templates,
  onSaved,
}: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [steps, setSteps] = useState<Step[]>(
    initialSteps.length > 0
      ? initialSteps.map((s) => ({
          step_number: s.step_number,
          template_id: s.template_id ?? '',
          delay_days: s.delay_days ?? 0,
        }))
      : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function addStep() {
    if (templates.length === 0) return;
    const nextNum = steps.length ? Math.max(...steps.map((s) => s.step_number)) + 1 : 1;
    setSteps([...steps, { step_number: nextNum, template_id: templates[0].id, delay_days: 0 }]);
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
    setError(null);
    const stepsWithTemplate = steps.filter((s) => s.template_id && s.template_id.trim() !== '');
    if (steps.length > 0 && stepsWithTemplate.length < steps.length) {
      setError('Select a template for each step.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim() || undefined,
        description: description.trim() || undefined,
        steps: steps.map((s, i) => ({
          step_number: i + 1,
          template_id: s.template_id,
          delay_days: s.delay_days ?? 0,
        })),
      };
      const res = await fetch(`/api/email-sequences/${sequenceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setSuccess(true);
      onSaved?.();
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 shadow-sm space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit sequence</h2>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-600 dark:text-green-400">Sequence saved.</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Steps</label>
          <button
            type="button"
            onClick={addStep}
            disabled={templates.length === 0}
            className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add step
          </button>
        </div>
        {templates.length === 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
            Create at least one email template under <strong>Templates</strong> first, then add steps here.
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Add one or more steps (template + delay in days). Click <strong>Save sequence</strong> to save name, description, and steps.
        </p>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3 items-center flex-wrap p-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Step {i + 1}</span>
              <select
                value={s.template_id}
                onChange={(e) => updateStep(i, 'template_id', e.target.value)}
                className="min-w-[180px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
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
                className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
              />
              <span className="text-xs text-gray-500">days after previous</span>
              <button type="button" onClick={() => removeStep(i)} className="text-sm text-red-600 hover:text-red-700">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save sequence'}
      </button>
    </form>
  );
}
