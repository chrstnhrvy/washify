# Washify — Project Guide

Multi-tenant laundry SaaS (portfolio project). Public landing page + a Google-auth
workspace where each shop owner manages orders, texts customers when laundry is
done (via n8n), and tracks sales. Free-tier only — "SaaS" means multi-tenant, not
paid. Full plan: [docs/washify-plan.md](docs/washify-plan.md). n8n build guide:
[docs/n8n-automation-tutorial.md](docs/n8n-automation-tutorial.md).

## 🛠️ Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build (type-check + bundle): `npm run build`  ← run before declaring "done"
- Type-check only: `npm run lint`
- Preview prod build: `npm run preview`

> There is no test runner yet. "No errors" = a clean `npm run build`.

## 🧰 Stack
React 18 + TypeScript (Vite) · Tailwind CSS v3 · Supabase (Auth + Postgres + RLS +
pgvector) · n8n automations · Groq + Gemini (RAG chatbot) · deployed on Vercel.
The app is a client-only SPA that talks directly to Supabase; isolation is
enforced by Row Level Security (`shop_id = auth.uid()`), not the frontend.

## 📁 Directory layout (feature-based)
```
src/
  components/ui/        shared primitives (Logo, GoogleButton)
  components/layout/    Navbar, Footer
  features/<name>/      one folder per feature; owns its components/hooks/types
    landing/  faq-chat/ auth/ orders/ dashboard/ settings/
  lib/                  shared clients & utils (n8n.ts; future: supabase.ts, excel.ts)
  app/                  authed /app shell + route guard (phase 2+)
  hooks/  types/        cross-feature hooks and domain types
supabase/               schema.sql, rls.sql, pgvector function (phase 3)
n8n/                    importable workflow JSONs (source of truth for webhooks)
docs/                   plan + tutorials
```
Empty future folders carry a `README.md` describing what belongs there. Put new
code in the matching `features/` folder; only truly shared code goes in
`components/`, `lib/`, `hooks/`, `types/`.

## 🔌 n8n webhook contracts (the live automations)
Configure the base URL via `VITE_N8N_BASE_URL` (see `.env.example`). Use the typed
client in [src/lib/n8n.ts](src/lib/n8n.ts) — never `fetch` these directly:
- `sendSms(phone, message)` → `POST /laundry-done` `{ phone, message }` → `{ status }`.
  Phone is normalized to E.164 inside n8n; keep `message` ≤160 chars.
- `askFaq(question)` → `POST /faq-chat` `{ question }` → `{ answer }`.
  ⚠️ The live workflow hard-codes the shop filter to `HAPPY_WASH_ID` and ignores
  any `shopId`; real multi-tenant FAQ routing is still TODO.

## 🎨 Brand — "Fresh & Clean" (Tailwind semantic tokens, no raw hex in components)
`primary` aqua `#06B6D4` · `accent` sunny `#FACC15` · `success` mint `#34D399` ·
`bg` `#F8FAFC` · `surface` `#FFFFFF` · `ink` slate `#0F172A` · `muted` `#64748B`.
Font: Inter.

## 🎯 Skills to use
- **ui-ux-pro-max** — for any UI work. Apply its Quick Reference (a11y contrast
  4.5:1, focus rings, 44px touch targets, 4/8pt spacing, ≥16px body text, SVG
  icons not emoji, `prefers-reduced-motion`, one primary CTA per section).
- **vercel-react-best-practices** — when writing/refactoring React (eliminate
  waterfalls, lazy-load heavy/below-fold components, memoize, functional setState).

## 🎨 Code style
- TypeScript everywhere; functional components with hooks.
- Keep components atomic and under ~150 lines.
- Tailwind exclusively — no raw CSS files or arbitrary inline style strings.
- Semantic HTML for layout; accessible labels on all interactive elements.
- When Supabase/server validation lands: validate inputs with Zod; never swallow
  errors silently (explicit try/catch).
