'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [from_email, setFromEmail] = useState('');
  const [from_name, setFromName] = useState('');
  const [brevo_smtp_login, setBrevoSmtpLogin] = useState('');
  const [brevo_smtp_key, setBrevoSmtpKey] = useState('');
  const [has_credentials, setHasCredentials] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/user/email-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.from_email) setFromEmail(data.from_email);
        if (data.from_name) setFromName(data.from_name);
        if (data.brevo_smtp_login) setBrevoSmtpLogin(data.brevo_smtp_login);
        setHasCredentials(!!data.has_credentials);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch('/api/user/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_email: from_email.trim(),
          from_name: from_name.trim() || undefined,
          brevo_smtp_login: brevo_smtp_login.trim(),
          brevo_smtp_key: brevo_smtp_key || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      setMessage({ type: 'success', text: 'Brevo email settings saved. Your account will be used when you run "Run due emails".' });
      setHasCredentials(true);
      setBrevoSmtpKey('');
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
        Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Add your Brevo SMTP credentials so the CRM can send emails from your Brevo account when you run &quot;Run due emails&quot;.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Brevo send settings</h2>
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {message.text}
          </p>
        )}
        <div>
          <label htmlFor="from_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            From email
          </label>
          <input
            id="from_email"
            type="email"
            value={from_email}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="myfromemail@mycompany.com"
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            The address recipients see as the sender. Use a verified sender in your Brevo account.
          </p>
        </div>
        <div>
          <label htmlFor="from_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            From name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="from_name"
            type="text"
            value={from_name}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="From name"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label htmlFor="brevo_smtp_login" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Brevo SMTP login
          </label>
          <input
            id="brevo_smtp_login"
            type="text"
            value={brevo_smtp_login}
            onChange={(e) => setBrevoSmtpLogin(e.target.value)}
            placeholder="a4917a001@smtp-brevo.com"
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            In Brevo: SMTP &amp; API → SMTP → your SMTP login (e.g. <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">xxx@smtp-brevo.com</code>).
          </p>
        </div>
        <div>
          <label htmlFor="brevo_smtp_key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Brevo SMTP key
          </label>
          <input
            id="brevo_smtp_key"
            type="password"
            value={brevo_smtp_key}
            onChange={(e) => setBrevoSmtpKey(e.target.value)}
            placeholder={has_credentials ? 'Leave blank to keep current' : 'Paste your SMTP key'}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            In Brevo: SMTP &amp; API → SMTP → create or copy your SMTP key. Server: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">smtp-relay.brevo.com</code>, port <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">587</code>. To change the SMTP login, re-enter the key.
          </p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary px-4 py-2.5 rounded-lg disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
