# Generator Cafe CRM

Internal web app for managing Buildathon outreach: centralize contacts, organize them in buckets and a pipeline, and run templated email sequences via Gmail. The app is deployed on Vercel; you connect it to your own Supabase project and Gmail account.

---

## For users of the deployed CRM

**Using the live app:** Open the deployed URL (e.g. your team’s Vercel link), log in with the credentials your admin gave you, and use Contacts, Pipeline, Buckets, Import, Templates, and Sequences as described below.

**Connecting the CRM to your account:** If you need to connect the deployed app to your own Supabase and Gmail (e.g. you’re the team setting it up), use the in-app guide:

- On the **login page**, click **“Setup guide — connect to your Supabase & Gmail”**, or go directly to **`/guide`** on the deployed site.

The guide walks through: creating a Supabase project, running the schema SQL, getting API keys, creating login users, setting up a Gmail App Password, and adding the required environment variables in Vercel so the deployment uses your backend and email.

---

## What the CRM does

- **Contacts** — List all outreach contacts with filters (category, status, bucket, company search). Edit contacts, assign buckets, view per-contact email history.
- **Pipeline** — Kanban by status (Not Contacted → Contacted → Responded → In Discussion → Confirmed / Declined). Drag cards to update status.
- **Buckets** — Named groups (e.g. “Anthropic”, “Harvard i-Labs”). Assign contacts to buckets; filter by bucket when launching sequences.
- **Company view** — See all contacts for a company and add new ones for that company.
- **Import** — Upload CSV or XLSX (Name, Title, Company, Email, LinkedIn, Category, Tier, Status, Notes); preview and bulk-import.
- **Email templates** — Reusable subject/body with `{{name}}` and `{{company}}` placeholders.
- **Email sequences** — Multi-step flows (e.g. Step 1: initial template, Step 2: follow-up after N days).
- **Launch sequence** — From Contacts, pick a sequence and filters; the CRM enrolls matching contacts and queues emails (step 1 soon, later steps by delay).
- **Send due emails** — “Run due emails” on a sequence’s page (or a cron calling the API) sends queued emails via Gmail (batch limit 50 per run).

Access is protected: only signed-in users (Supabase Auth) can use the app.

---

## How to use it (day to day)

1. **Log in** with your team email and password.
2. **Contacts** — Add or import contacts, set category/status, assign buckets. Use search and filters.
3. **Pipeline** — Drag cards between columns to move contacts through stages.
4. **Buckets** — Create buckets and add contacts from each bucket’s page.
5. **Templates** — Create email templates with `{{name}}` and `{{company}}`.
6. **Sequences** — Create sequences and add steps (template + delay in days).
7. **Launch** — From Contacts, click “Launch email sequence”, choose sequence and filters, confirm to enroll.
8. **Send** — On a sequence’s page, click “Run due emails” to send queued emails (or use an automated cron).
9. **Monitor** — Same sequence page shows enrolled/sent/queued/errors and a table of email events.

---

## Stack

- **Frontend / API:** Next.js 14 (App Router), TypeScript, Tailwind CSS  
- **Database & Auth:** Supabase (Postgres + Supabase Auth)  
- **Email:** Nodemailer with Gmail SMTP  
- **Deployment:** Vercel (environment variables set in the Vercel project)

---

## Repo / developers

- **`supabase.sql`** — Schema to run once in Supabase SQL Editor (referenced in the in-app guide).
- **`app/guide/page.tsx`** — Public setup guide at `/guide` (no login required).
- **`.env.local.example`** — Reference for the env vars the deployed app needs (configured in Vercel, not by cloning).
