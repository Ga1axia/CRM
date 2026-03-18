import Link from 'next/link';

export const metadata = {
  title: 'Help | Generator CRM',
  description: 'Guide to all CRM features: contacts, pipeline, buckets, import, templates, and email sequences',
};

const sections = [
  { id: 'contacts', title: 'Contacts' },
  { id: 'pipeline', title: 'Pipeline' },
  { id: 'buckets', title: 'Buckets' },
  { id: 'company', title: 'Company view' },
  { id: 'import', title: 'Import' },
  { id: 'templates', title: 'Email templates' },
  { id: 'sequences', title: 'Email sequences' },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
        Help
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        A guide to every feature in the CRM. Use the list below to jump to a section.
      </p>

      <nav className="mb-10 p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          In this guide
        </h2>
        <ul className="space-y-2">
          {sections.map(({ id, title }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="text-[var(--accent)] hover:underline font-medium"
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-12 text-gray-700 dark:text-gray-300">
        <section id="contacts" className="scroll-mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Contacts
          </h2>
          <p className="mb-3">
            <Link href="/contacts" className="text-[var(--accent)] hover:underline font-medium">Contacts</Link> is your central list of everyone you’re reaching out to. Each contact has a name, title, company, email, optional LinkedIn, category, tier, status, and notes.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
            <li><strong>Add a contact</strong> — Click <strong>Add contact</strong>, fill in the form, and save.</li>
            <li><strong>Edit a contact</strong> — Open the ⋮ menu on a row and choose <strong>Edit</strong>.</li>
            <li><strong>Filter and search</strong> — Use the search box and the Category, Status, and Bucket dropdowns to narrow the list.</li>
            <li><strong>View email history</strong> — Open the ⋮ menu and choose <strong>Email history</strong> to see all emails sent to that contact (e.g. from sequences).</li>
            <li><strong>Launch an email sequence</strong> — Click <strong>Launch email sequence</strong>, pick a sequence and optional filters (category, status, bucket). Matching contacts are enrolled in the sequence; step 1 is queued soon, later steps by delay.</li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Status values (e.g. Not Contacted, Contacted, Responded) drive the Pipeline view. Category and tier help you segment contacts for filters and sequences.
          </p>
        </section>

        <section id="pipeline" className="scroll-mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Pipeline
          </h2>
          <p className="mb-3">
            The <Link href="/pipeline" className="text-[var(--accent)] hover:underline font-medium">Pipeline</Link> is a Kanban board. Each column is a contact status (e.g. Not Contacted → Contacted → Responded → In Discussion → Confirmed / Declined).
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Move a contact</strong> — Drag a card from one column and drop it into another. The contact’s status is updated automatically.</li>
            <li><strong>Open a contact</strong> — Click a card to go to that contact’s context (e.g. edit or email history from the Contacts page).</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            The pipeline reflects the same statuses you see and filter by on the Contacts page.
          </p>
        </section>

        <section id="buckets" className="scroll-mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Buckets
          </h2>
          <p className="mb-3">
            <Link href="/buckets" className="text-[var(--accent)] hover:underline font-medium">Buckets</Link> are named groups (e.g. “Anthropic”, “Harvard i-Labs”). Use them to organize contacts and to target who gets enrolled when you launch a sequence.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
            <li><strong>Create a bucket</strong> — On the Buckets page, create a new bucket with a name (and optional description).</li>
            <li><strong>Add contacts to a bucket</strong> — Open a bucket, then add contacts from the “All contacts” list. You can also assign a bucket when adding or editing a contact on the Contacts page.</li>
            <li><strong>Remove from bucket</strong> — From the bucket’s detail page, remove a contact from the bucket.</li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            When you launch a sequence from Contacts, you can filter by bucket so only contacts in that bucket are enrolled.
          </p>
        </section>

        <section id="company" className="scroll-mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Company view
          </h2>
          <p className="mb-3">
            From a contact’s row or from links that show a company name, you can open the <strong>Company view</strong> for that company. It lists all contacts tied to that company name and lets you add new contacts for the same company.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Company is determined by the <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">company_name</code> field on each contact.
          </p>
        </section>

        <section id="import" className="scroll-mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Import
          </h2>
          <p className="mb-3">
            <Link href="/import" className="text-[var(--accent)] hover:underline font-medium">Import</Link> lets you bulk-add contacts from a CSV or XLSX file.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
            <li><strong>Prepare your file</strong> — Include columns such as: Name, Title, Company, Email, LinkedIn, Category, Tier, Status, Notes. Headers are matched (case-insensitive) to these names.</li>
            <li><strong>Upload</strong> — Choose your file. The app parses it and shows a preview table.</li>
            <li><strong>Review and import</strong> — Check the preview, fix any mapping if needed, then run the import. New contacts are created; duplicates (e.g. by email) are typically skipped or handled per the import logic.</li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            After import, contacts appear in Contacts and in the Pipeline according to their status.
          </p>
        </section>

        <section id="templates" className="scroll-mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Email templates
          </h2>
          <p className="mb-3">
            <Link href="/templates" className="text-[var(--accent)] hover:underline font-medium">Templates</Link> are reusable email subjects and bodies. They’re used by sequences to send personalized emails.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
            <li><strong>Create a template</strong> — Add a name, subject line, and body. Use placeholders <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">{"{{name}}"}</code> and <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">{"{{company}}"}</code>; they’re replaced with the contact’s name and company when the email is sent.</li>
            <li><strong>Edit a template</strong> — Open the template from the list and edit; save your changes.</li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You need at least one template before you can add steps to a sequence.
          </p>
        </section>

        <section id="sequences" className="scroll-mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Email sequences
          </h2>
          <p className="mb-3">
            <Link href="/sequences" className="text-[var(--accent)] hover:underline font-medium">Sequences</Link> are multi-step email flows: e.g. Step 1 = initial outreach, Step 2 = follow-up 3 days later.
          </p>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
            Creating a sequence and adding steps
          </h3>
          <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
            <li>On the Sequences page, create a <strong>new sequence</strong> (name only). You’re taken to that sequence’s detail page.</li>
            <li>In the <strong>Edit sequence</strong> section, set the sequence <strong>name</strong> and <strong>description</strong> (optional).</li>
            <li>Click <strong>+ Add step</strong>. For each step, choose an <strong>email template</strong> and set <strong>days after previous</strong> (e.g. 0 for step 1, 3 for step 2 = 3 days after step 1 is sent).</li>
            <li>Click <strong>Save sequence</strong> to save the name, description, and all steps. If you don’t have any templates yet, create at least one under Templates first.</li>
          </ul>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
            Launching a sequence
          </h3>
          <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
            <li>Go to <strong>Contacts</strong>, then click <strong>Launch email sequence</strong>.</li>
            <li>Select the sequence and optionally filter by category, status, or bucket. The preview shows how many contacts match.</li>
            <li>Confirm to enroll those contacts. Step 1 is scheduled soon; later steps are scheduled based on each step’s delay (e.g. 3 days after the previous step is sent).</li>
          </ul>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
            Sending queued emails and monitoring
          </h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>On the sequence’s detail page, the <strong>Sequence monitor</strong> shows how many events are queued, sent, or errored.</li>
            <li>Click <strong>Run due emails</strong> to send all emails that are due (up to the batch limit, e.g. 50 per run). In production, a cron job often calls this automatically so you don’t have to click every time.</li>
            <li>The events table lists recent activity per contact (queued, sent, error) so you can troubleshoot and see who received which step.</li>
          </ul>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Need to connect this app to your own Supabase or Gmail? See the <Link href="/guide" className="text-[var(--accent)] hover:underline">Setup guide</Link> (for the deployed app).
        </p>
      </div>
    </div>
  );
}
