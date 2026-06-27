# Washify — Multi-Shop Laundry Manager

A portfolio project showcasing **full-stack + automation** work. Washify is a
lightweight, multi-tenant laundry manager: any shop owner signs in with Google,
gets their own private workspace, tracks orders, texts customers when their
laundry is done (via an **n8n** automation), and views sales with one-click
**Excel export**. A public **AI FAQ chatbot** answers customer questions,
grounded only in each shop's own FAQ.

Free to run on free tiers — "multi-tenant" here means isolated workspaces, not
paid subscriptions.

## Features

- **Google sign-in** — each owner gets an isolated shop (Supabase Auth).
- **Orders** — add drop-offs, auto-calculated totals, status pipeline
  (Received → Washing → Ready → Picked up), search, and paid tracking.
- **Text Customer** — one tap sends a real SMS (or Messenger) through an n8n workflow.
- **AI message drafting** — generate a friendly notification with one click (Groq).
- **Sales dashboard** — revenue / loads / orders by day, week, or month, with
  charts and **.xlsx export**.
- **Customers** — directory auto-built from orders, with visit counts.
- **FAQ chatbot** — public RAG assistant (Groq + Gemini + pgvector via n8n).
- **Multi-tenant isolation** — enforced by Postgres **Row Level Security**
  (`shop_id = auth.uid()`), not the frontend.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript (Vite), Tailwind CSS, React Router |
| Auth / DB | Supabase (Google OAuth, Postgres + RLS, pgvector) |
| Automation | n8n (SMS, Messenger, AI drafting, RAG FAQ chatbot) |
| SMS | SMS API PH (free PH gateway) |
| AI | Groq LLM + Google Gemini embeddings |
| Hosting | Vercel (app), Oracle Cloud Free (n8n) |

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:5173
```

`.env`:
```
VITE_N8N_BASE_URL=http://localhost:5678/webhook
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Database setup: run the SQL in [supabase/schema.sql](supabase/schema.sql),
[rls.sql](supabase/rls.sql), and [provision_shop.sql](supabase/provision_shop.sql)
(plus the `migration_*.sql` files) in the Supabase SQL editor. Importable n8n
workflows live in [n8n/](n8n/).

## Project structure

```
src/
  app/            authed workspace shell, routing, route guard
  components/     ui/ (shared primitives) + layout/ (navbar, footer)
  features/
    landing/      public marketing page
    auth/         Supabase Google OAuth
    orders/       order entry, list, status, Text Customer, receipts
    dashboard/    sales stats, charts, Excel export
    customers/    customer directory
    settings/     shop name, pricing, account deletion
    faq-chat/     public RAG chat widget
  lib/            supabase + n8n clients
supabase/         schema, RLS, provisioning, migrations
n8n/              importable workflow JSONs
```

## n8n webhooks

The app calls these webhooks via the typed client in
[src/lib/n8n.ts](src/lib/n8n.ts):

- `POST /laundry-done` `{ phone, message }` → sends the SMS.
- `POST /messenger-send` `{ psid, message }` → sends a Messenger message.
- `POST /draft-message` `{ ... }` → returns an AI-drafted `{ message }`.
- `POST /faq-chat` `{ question }` → returns a grounded `{ answer }`.

## Scripts

```bash
npm run dev       # dev server
npm run build     # type-check + production build
npm run lint      # type-check only
npm run preview   # preview the production build
```

## Deploy

Push to GitHub, import the repo in **Vercel**, and add the `VITE_*` env vars.
[vercel.json](vercel.json) handles SPA routing. Add your Vercel URL to Supabase's
allowed redirect URLs, and host the n8n workflows somewhere public (e.g. Oracle
Cloud Free) so the webhooks are reachable.

---

Built as a portfolio project. Not affiliated with any real laundry business.
