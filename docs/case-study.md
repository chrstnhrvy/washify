# Washify — Case Study (how it all came together)

A walkthrough of what Washify is, the decisions behind it, and how the
automation and AI pieces fit together. Written to be presented in an
**AI / Automation Specialist** interview.

---

## 1. The one-line pitch

> Washify is a multi-tenant SaaS-style laundry manager where any shop owner
> signs in with Google, runs their orders, and — the showpiece — **texts
> customers automatically via an n8n workflow** and answers customer questions
> with a **RAG chatbot**. It runs entirely on free tiers.

The point of the project isn't laundry. It's to demonstrate, end to end:
**workflow automation (n8n), a retrieval-augmented AI assistant, and a
real multi-tenant system** wired together cleanly.

---

## 2. The problem it models

A small laundromat has three recurring pains:
1. **"Is my laundry done?"** — staff manually call/text customers.
2. **Repeated questions** — hours, prices, turnaround, asked all day.
3. **No records** — sales and order history live on paper.

Washify automates all three: one-tap SMS, an always-on FAQ assistant, and a
sales dashboard with export. Each shop is isolated, so it behaves like a real
SaaS product.

---

## 3. Architecture at a glance

```
                        ┌─────────────────────────────┐
   Public visitor ──────▶  Landing page (Vercel, SPA)  │
                        │  + FAQ chat widget           │
                        └───────────────┬──────────────┘
                                        │ POST /faq-chat
 Shop owner ──Google OAuth──▶ /app (auth-gated)        │
        │                     orders · sales · settings │
        │                                               │
        ▼ read/write (scoped by RLS)                    ▼
   ┌─────────────────────────┐            ┌──────────────────────────┐
   │ Supabase Postgres        │            │ n8n (Docker / Oracle Free)│
   │  shops/orders/customers  │            │  • /laundry-done  → SMS   │
   │  + RLS (shop_id=auth.uid)│            │  • /faq-chat      → RAG   │
   │  + pgvector (FAQ embeds) │◀───────────┤  retrieval + Groq answer  │
   └─────────────────────────┘            └──────────────────────────┘
                                              │            │
                            SMS API PH (SMS) ◀┘            └▶ Groq LLM + Gemini embeddings
```

**Why this shape:** the React app talks **directly** to Supabase using the
signed-in user's token, and **Row Level Security** guarantees isolation, so
there's no custom backend to maintain. Anything that's "automation" (sending an
SMS, answering with AI) is pushed into **n8n** behind a webhook — which is
exactly the separation an automation specialist should be making.

---

## 4. The automation layer (n8n) — the centerpiece

Two independent workflows, each exposed as a webhook the app calls.

### 4a. "Laundry is done" SMS notifier — `POST /laundry-done`

```
Webhook → Build Message (Set) → HTTP Request (SMS API PH) → Respond
```

- The app sends `{ phone, message }`.
- **Build Message** normalizes the phone to E.164 with a small expression
  (`0917… / 63… / +63…` all become `+639XXXXXXXXX`) so staff can type numbers
  naturally.
- **HTTP Request** calls SMS API PH (a free PH gateway) with an `x-api-key`
  header; it auto-falls back to email/push if SMS can't be delivered.
- **Respond** returns `{ "status": "sent" }`.

**Design choices worth saying out loud:**
- The message is composed **in the app** (name already substituted, capped at
  160 chars = one SMS segment), so **one shared workflow serves every shop** — n8n
  just relays and delivers. That keeps the automation simple and multi-tenant.
- The webhook is the integration seam: the app doesn't know or care *how* the
  SMS is sent. I could swap SMS API PH for Twilio/Semaphore by editing one node,
  no app change.

### 4b. RAG FAQ chatbot — `POST /faq-chat`

Two workflows: one to **ingest** knowledge, one to **answer**.

**Ingest (run once / when the FAQ changes):**
```
Manual Trigger → FAQ text (Set) → Supabase Vector Store (insert)
                                   ├─ Embeddings: Google Gemini (text-embedding-004, 768-dim)
                                   └─ Default Data Loader + text splitter
```

**Answer (live):**
```
Webhook → Question & Answer Chain → Respond
            ├─ Groq Chat Model (llama-3.3-70b-versatile)  ← generates the answer
            └─ Vector Store Retriever
                 └─ Supabase Vector Store (pgvector)
                      └─ Embeddings: Google Gemini          ← finds relevant FAQ
```

The app sends `{ question }`; the chain embeds it, retrieves the closest FAQ
chunks from pgvector, feeds them to Groq with a system prompt ("answer only from
context, never invent"), and returns `{ answer }`.

**Why mix two AI providers?** Groq is fast and free for *generation*; Gemini's
`text-embedding-004` is free for *embeddings* (Groq doesn't do embeddings).
Using the right tool for each half is a deliberate, cost-aware decision.

---

## 5. The RAG pipeline, explained simply

Retrieval-Augmented Generation = *retrieve facts first, then let the model
answer from them* — so it stays grounded and doesn't hallucinate policies.

1. **Ingest:** split the knowledge base into chunks → turn each into a 768-dim
   vector with Gemini → store in Supabase `pgvector`.
2. **Query:** embed the question → cosine-similarity search for the nearest
   chunks → hand them to Groq with a strict system prompt → return the answer.

The knowledge base is deliberately **about the app's features** (generic), so
shop-specific facts (rates, hours) are answered as "set by each shop." That
keeps the bot honest rather than quoting a hardcoded price.

---

## 6. Multi-tenant design & security

- One **Google account → one shop**, keyed so `shops.id = auth.uid()`.
- Every table (`orders`, `customers`) carries `shop_id`, and **Row Level
  Security** policies allow access only where `shop_id = auth.uid()`.
- Isolation is enforced **in the database**, not the frontend — even a forged
  client request can't read another shop's rows.
- A **Postgres trigger** auto-provisions a shop row on first sign-in, so
  onboarding is seamless.

This is the part I'd emphasize for "did you actually build a system": the
security model doesn't trust the client at all.

---

## 7. Frontend architecture

- **React + TypeScript (Vite)**, **Tailwind**, **React Router**.
- **Feature-based structure** (`features/orders`, `features/dashboard`,
  `features/auth`, …) so each capability owns its components and hooks.
- **Code-splitting:** the authed workspace, the chat widget, and the Excel
  library (`xlsx`) are all lazy-loaded, so public visitors download almost none
  of the app code. `xlsx` only loads when someone clicks Export.
- **UX rigor:** accessible (focus rings, 44px touch targets, semantic labels,
  reduced-motion), optimistic updates on status/paid toggles, and a typed n8n
  client that tolerates empty webhook responses instead of crashing.

---

## 8. Tech stack & the free-tier rationale

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TS (Vite), Tailwind | Fast, typed, deploys as static |
| Auth + DB | Supabase | Auth + Postgres + RLS + pgvector in one free backend |
| Automation | n8n (Docker → Oracle Cloud Free) | Visual, swappable, the automation showpiece |
| SMS | SMS API PH | Free PH gateway, no opt-in needed |
| LLM | Groq | Free, very fast inference |
| Embeddings | Gemini text-embedding-004 | Free embeddings to pair with Groq |
| Hosting | Vercel | Auto-deploy from GitHub |

Everything is free tier on purpose: the goal was to prove the *architecture*,
not spend money — and to show I can scope a real system within constraints.

---

## 9. How it came together (build order)

1. Landing page + brand + the n8n client contract.
2. Supabase Google OAuth + protected routing + shop provisioning trigger.
3. Schema + RLS.
4. Orders: entry, status pipeline, search, paid tracking.
5. Sales dashboard + charts + Excel export.
6. Text Customer button wired to the SMS webhook.
7. RAG chatbot widget wired to the FAQ webhook.
8. First-login onboarding + per-load / per-kilo pricing.

Built in vertical slices, each one deployable and verified with a clean
type-check + production build before moving on.

---

## 10. What this demonstrates (map to the role)

- **Workflow automation:** designed, built, and debugged real n8n workflows
  with webhooks, data transforms, external API calls, and error paths.
- **Applied AI / RAG:** a working retrieval pipeline with a vector DB, an
  embeddings model, and an LLM, plus prompt design to keep it grounded.
- **Integration thinking:** the app and automations are decoupled behind
  webhooks, so either side can change independently.
- **System design:** multi-tenant data model with database-enforced isolation.
- **Shipping discipline:** typed, accessible, code-split, deployed, documented.

---

## 11. Honest limitations & how I'd extend it

- **Chatbot is currently single-knowledge-base.** The retriever filter is fixed;
  true per-shop retrieval would pass `shop_id` from the request and filter the
  vector search by metadata. (The schema and plan already support this.)
- **SMS gateway is a free community service** — fine for a demo, not for
  production SLAs; I'd move to a paid gateway (Semaphore/Twilio) by editing one
  n8n node.
- **No "where's my laundry?" lookup** for customers yet — that would be a third,
  authenticated workflow, kept separate from the public bot for privacy.

---

## 12. A few war stories (good interview color)

- **Empty webhook response:** the SMS call returned `200` with an empty body,
  which crashed the client on `JSON.parse("")`. Fixed by making the n8n client
  tolerate empty/non-JSON responses — a reminder that integration code must be
  defensive about what a third party actually returns.
- **Leaked API key:** an SMS key was hardcoded in a committed workflow JSON and
  caught by a secret scanner. Remediation: redact to a placeholder, keep real
  keys only in n8n, and rotate the exposed key (redacting alone doesn't remove
  it from git history). Good example of secure-by-default habits.
- **Version-sensitive AI nodes:** n8n's LangChain nodes change across releases,
  so the RAG workflow is best rebuilt node-by-node rather than blindly imported —
  a real-world automation gotcha.
