import Link from 'next/link';

export const metadata = {
  title: 'Setup guide | Generator CRM',
  description: 'Connect the CRM to your Supabase project; users add Brevo SMTP in Settings',
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
          Connect this CRM to your own Supabase project. Sign-in uses Supabase Auth; each user adds their Brevo SMTP credentials in Settings to send emails from their account.
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
              4. Add environment variables to the deployed app
            </h2>
            <p className="mb-3">
              The CRM is deployed on Vercel. To connect it to <em>your</em> Supabase project, set these environment variables. If you are the Vercel project owner:
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
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              After saving, trigger a <strong>redeploy</strong> (Deployments → … → Redeploy). No SMTP env vars are required: each user adds their own <strong>Brevo</strong> SMTP credentials in the app under <strong>Settings</strong> so emails are sent from their Brevo account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Set up Brevo (per user)
            </h2>
            <p className="mb-3">
              Each user who will send emails must have a <a href="https://www.brevo.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Brevo</a> account. In Brevo: <strong>SMTP &amp; API → SMTP</strong> — note your <strong>SMTP login</strong> (e.g. <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">xxx@smtp-brevo.com</code>) and create an <strong>SMTP key</strong>. Server: <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">smtp-relay.brevo.com</code>, port <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">587</code>.
            </p>
            <p>
              After signing in to the CRM, go to <strong>Settings</strong> and enter your From email, optional From name, Brevo SMTP login, and Brevo SMTP key. Those credentials are stored on your account and used when you run &quot;Run due emails&quot;.
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
              <li><strong>Emails not sending</strong> — Go to <strong>Settings</strong> and add your Brevo SMTP login and SMTP key. Use a verified sender as From email. Then run “Run due emails” on the sequence page (or use a cron that calls the send-due API).</li>
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
