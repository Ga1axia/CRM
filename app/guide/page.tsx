import Link from 'next/link';

export const metadata = {
  title: 'Setup guide | Generator CRM',
  description: 'Connect the CRM to your Supabase and Gmail account',
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline mb-8"
        >
          ← Back to login
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          Setup guide
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">
          Connect this CRM to your own Supabase project and Gmail so your team can use the deployed app with your data and email.
        </p>

        <div className="space-y-10 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Create a Supabase project
            </h2>
            <p className="mb-3">
              Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">app.supabase.com</a> and create a new project (or use an existing one). Wait for it to finish provisioning.
            </p>
            <p>
              In the dashboard, open <strong>SQL Editor</strong>. You need the CRM schema: get the <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">supabase.sql</code> file from this project (or from whoever deployed the app), paste its full contents into the SQL Editor, and run it. This creates the tables (contacts, buckets, email_templates, email_sequences, email_events, etc.), indexes, and RLS policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Get your Supabase keys
            </h2>
            <p className="mb-3">
              In Supabase, go to <strong>Project Settings → API</strong>. You will need:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Project URL</strong> — e.g. <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">https://xxxx.supabase.co</code></li>
              <li><strong>anon public</strong> key — under “Project API keys”</li>
              <li><strong>service_role</strong> key — same section (keep this secret; it bypasses RLS)</li>
            </ul>
            <p className="mt-3">
              These will be added to the deployed app’s environment variables (see step 5).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Create login users
            </h2>
            <p className="mb-3">
              In Supabase, go to <strong>Authentication → Users → Add user</strong>. Create at least one user with an email and password. These credentials are what your team will use to sign in at the CRM’s login page.
            </p>
            <p>
              You can add more users later from the same Authentication → Users section.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Set up Gmail for sending email
            </h2>
            <p className="mb-3">
              The CRM sends emails (e.g. from sequences) via Gmail. Use a dedicated account (e.g. <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">outreach@yourdomain.com</code> or a Gmail address).
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Enable <strong>2-Step Verification</strong> on that Google account (required for App Passwords).</li>
              <li>In Google Account → <strong>Security → 2-Step Verification → App passwords</strong>, create a new app password for “Mail”.</li>
              <li>Copy the 16-character password. This will be used as <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">SMTP_PASS</code> — never use your normal Gmail password.</li>
            </ol>
            <p className="mt-3">
              You will need: the Gmail address, the App Password, and a “From” display name (e.g. <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">"Generator Outreach &lt;outreach@gmail.com&gt;"</code>).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Add environment variables to the deployed app
            </h2>
            <p className="mb-3">
              The CRM is already deployed on Vercel. To connect it to <em>your</em> Supabase and Gmail, the project’s environment variables must be set. If you are the Vercel project owner:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2 mb-4">
              <li>Open the project on <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">vercel.com</a>.</li>
              <li>Go to <strong>Settings → Environment Variables</strong>.</li>
              <li>Add the following (for Production, and optionally Preview/Development):</li>
            </ol>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 p-4 overflow-x-auto">
              <table className="text-sm w-full">
                <thead>
                  <tr className="text-left border-b border-gray-300 dark:border-gray-600">
                    <th className="py-2 pr-4 font-semibold">Variable</th>
                    <th className="py-2 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr><td className="py-2 pr-4 font-mono">NEXT_PUBLIC_SUPABASE_URL</td><td className="py-2">Your Supabase Project URL</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</td><td className="py-2">Supabase anon public key</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">SUPABASE_SERVICE_ROLE_KEY</td><td className="py-2">Supabase service_role key (keep secret)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">SMTP_HOST</td><td className="py-2">smtp.gmail.com</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">SMTP_PORT</td><td className="py-2">587</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">SMTP_USER</td><td className="py-2">Your Gmail address</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">SMTP_PASS</td><td className="py-2">Gmail App Password (16 chars)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">SMTP_FROM</td><td className="py-2">e.g. "Your Name &lt;you@gmail.com&gt;"</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              After saving, trigger a <strong>redeploy</strong> (Deployments → … → Redeploy) so the new variables take effect. If someone else manages the Vercel project, send them this list and your values (via a secure channel) so they can add the variables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Sign in and start using the CRM
            </h2>
            <p className="mb-3">
              Once the deployment has the correct environment variables and has been redeployed:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Open the CRM URL (your Vercel deployment).</li>
              <li>You will be sent to the login page. Sign in with one of the Supabase users you created.</li>
              <li>Use <strong>Contacts</strong> to add or import contacts, <strong>Pipeline</strong> to move them by status, <strong>Buckets</strong> to group them, and <strong>Templates</strong> / <strong>Sequences</strong> to run email campaigns. Click “Launch email sequence” from Contacts to enroll people; use “Run due emails” on a sequence’s page to send queued emails (or set up a cron to call the send-due API).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Troubleshooting
            </h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>“Connect Timeout” or “fetch failed”</strong> — The app can’t reach Supabase. Confirm the Project URL has no trailing slash and your Supabase project isn’t paused. Check Vercel env vars were saved and a redeploy was done.</li>
              <li><strong>Can’t log in</strong> — Ensure the user exists under Supabase Authentication → Users and that <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> match that project.</li>
              <li><strong>Emails not sending</strong> — Verify <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">SMTP_*</code> in Vercel, use the App Password (not your normal password), and that you’ve clicked “Run due emails” or have a cron hitting the send-due endpoint.</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}
