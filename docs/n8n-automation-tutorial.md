# 🫧 Washify — n8n Automation Tutorial

This guide teaches you to build the two n8n automations that power **Washify** — a multi-tenant laundry SaaS where each shop owner signs in with Google and gets their own isolated workspace:

1. **"Laundry is Done" notifier** → SMS via SMS API PH
2. **RAG FAQ Chatbot** → Groq + Gemini embeddings + Supabase pgvector

## How to use this guide

Every step has two parts:

- **📖 Learn (do it yourself):** the manual steps, so you actually understand what's happening.
- **📋 Copy-paste backup:** ready-made config / JSON / SQL for when you're racing the clock.

Do the **Learn** path first. Fall back to **Copy-paste** only if you're running out of time.

---

## Prerequisites

- **Docker** installed on your machine
- A free **SMS API PH** account (free Philippine SMS gateway) → <https://smsapiph.netlify.app>
- A free **Groq** account → <https://console.groq.com>
- A free **Google AI Studio** API key (for Gemini embeddings) → <https://aistudio.google.com/app/apikey>
- A free **Supabase** account → <https://supabase.com> (the same project powers Washify's database, auth, and the chatbot's vector store)

---

# Part 0 — Run n8n locally with Docker Desktop

> **Docker Desktop** is the recommended way on Windows and Mac. It bundles the full Docker engine with a visual dashboard so you can start, stop, and monitor containers without memorising CLI commands — perfect for learning.

### 📖 Learn

1. Download and install **Docker Desktop** from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) (free).
2. Open Docker Desktop and wait for the engine to start — the whale icon in your taskbar / menu bar turns **green** when it's ready.
3. Create a new folder anywhere on your machine (e.g. `washify-n8n`) and save the `docker-compose.yml` from the copy-paste section below inside it.
   - The `n8n_data` **volume** is Docker-managed storage that lives outside the container, so all your workflows and credentials survive restarts and updates.
4. Open a terminal, `cd` into that folder, and run:
   ```bash
   docker compose up -d
   ```
   This is the **only terminal command you need**. The `-d` flag runs it in the background.
5. Switch to Docker Desktop — you'll see an `n8n` container listed with a **green dot** (running). From now on you can **start, stop, and restart** it by clicking buttons here without touching the terminal.
6. Open <http://localhost:5678> in your browser and create your local owner account.
7. Done! Every workflow you build here gets a webhook URL like `http://localhost:5678/webhook/...`.

> **Tip:** The **Logs** tab inside Docker Desktop is your best debugging tool — if n8n behaves unexpectedly, open it there first before googling.

### 📋 Copy-paste backup

Save this as `docker-compose.yml` in your folder:

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

Then in a terminal inside that folder:

```bash
docker compose up -d
```

> **Webhook URLs:** while editing, n8n gives you a **Test URL** (`/webhook-test/...`) that only listens when you click *Execute workflow*. After you **Activate** the workflow, the **Production URL** (`/webhook/...`) works permanently. Use the Test URL while building, the Production URL from your app.

---

# Part 1 — "Laundry is Done" Notifier (SMS via SMS API PH)

**Goal:** when staff tap **Text Customer** in the web app, n8n receives the order info and sends a real SMS straight to the customer's phone via **SMS API PH** (a free Philippine SMS gateway).

**Flow:** `Webhook → Build Message → Send SMS (SMS API PH) → Respond`

> **Why SMS API PH?** It's a **100% free** Philippine SMS gateway — no credit card, no top-up — that sends real SMS to Globe, Smart, and DITO numbers with **no opt-in required** (unlike chat apps, where the person has to message your bot first). The same API key also gives you automatic **fallback to email, then push** if an SMS can't be delivered.
>
> **Good to know before you depend on it:**
> - **It's a free community project** (donation-funded). Perfect for a prototype / portfolio demo, but don't promise a paying client production-grade uptime on it.
> - **Rate limit: 1 SMS every 10 seconds.** Plenty for texting one customer at a time — just no bulk blasts.
> - **Phone numbers must be E.164 format** (`+639XXXXXXXXX`). The workflow below normalizes this for you automatically, so staff can type `0917…` as usual.

## Step 1.1 — Create an SMS API PH account & get your API key

### 📖 Learn

1. Go to <https://smsapiph.netlify.app> and click **Get Free API Key** (it sends you to `/register`). Sign up — no credit card, free forever.
2. In your dashboard, **create a new API key**. It looks like `sk-xxxxxxxxxxxxxx`. Copy it.
3. That one key works for **SMS, email, and push**. You send it in an **`x-api-key`** request header (note: this is an `x-api-key` header, **not** a `Bearer` token).

> Keep your API key secret. There's no balance to drain, but anyone with it can send messages as you and burn through your rate limit.

## Step 1.2 — Build the workflow

### 📖 Learn

Create a new workflow and add these nodes, connecting them left to right:

1. **Webhook** node
   - HTTP Method: `POST`
   - Path: `laundry-done`
   - Respond: `Using Respond to Webhook node`
2. **Edit Fields (Set)** node — name it `Build Message`. Add **two** string fields (expression mode):
   - `message` — the text the staff typed in the app's message box (the app already swapped `{Customer Name}` for the real name):
     - `{{ $json.body.message }}`
   - `recipient` — normalizes the phone to E.164 so staff can type any common format (in expression mode, type just the expression — do **not** include a leading `=`; n8n adds that internally, so you only see it in the exported workflow JSON):
     - `{{ '+63' + $json.body.phone.replace(/\D/g, '').replace(/^0/, '').replace(/^63/, '') }}`
3. **HTTP Request** node — name it `Send SMS (SMS API PH)`
   - Method: `POST`
   - URL: `https://smsapiph.onrender.com/api/v1/send/sms`
   - **Headers** (Send Headers = on):
     - `x-api-key` → `YOUR_API_KEY`
   - **Body** (Send Body = on, Body Content Type: `JSON`):
     ```json
     {
       "recipient": "{{ $json.recipient }}",
       "message": "{{ $json.message }}"
     }
     ```
4. **Respond to Webhook** node
   - Respond with a small JSON like `{ "status": "sent" }`

**Why this shape:** the Webhook is the door your app knocks on; Build Message relays the staff's message text *and* fixes the phone format; the HTTP Request node calls the SMS API PH endpoint with your `x-api-key` — and that same call automatically falls back to email, then push, if the SMS can't be delivered; Respond tells the app it worked so the button can show a ✅.

> **Tip — respect the rate limit:** SMS API PH allows **1 SMS per 10 seconds**. For a laundry shop texting one customer at a time that's fine, but don't loop it to text many customers at once or you'll get throttled. Keep SMS sending behind sign-in.

## Step 1.3 — Test it

### 📖 Learn

1. Click **Execute workflow** (this arms the Test URL).
2. From a terminal, send a fake order to the webhook (see copy-paste). **Use your own phone number** as `phone` so the test text comes to you.
3. Check your phone for the SMS. 🎉
4. **Activate** the workflow (top-right toggle) to get the permanent Production URL.

### 📋 Copy-paste backup — test request

```bash
curl -X POST http://localhost:5678/webhook-test/laundry-done \
  -H "Content-Type: application/json" \
  -d '{"phone":"09171234567","message":"Hi Juan. Your laundry is done."}'
```

> Use a real Philippine mobile number you own for the test — SMS API PH sends an actual SMS. You can type the number as `09XXXXXXXXX`, `639XXXXXXXXX`, or `+639XXXXXXXXX`; the **Build Message** node converts it to the required E.164 form (`+639XXXXXXXXX`) automatically.

## Step 1.4 — Connect the app's "Text Customer" button

Each order has an editable **message textbox**, pre-filled with `Hi {Customer Name}. Your laundry is done.` and capped at **160 characters** (one SMS segment). Staff can reword it per customer. When they tap **Text Customer**, the app replaces `{Customer Name}` with the real customer name and `fetch`es the **Production URL** with just the customer's phone and the final message (the shop context already lives in the app, so the webhook only needs these two):

```ts
await fetch("http://localhost:5678/webhook/laundry-done", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phone, message }),
})
```

> **Why 160 characters?** A standard SMS segment is 160 characters; keeping the box under that limit means every message stays a single (free) SMS instead of being split into multiple. Enforce it on the textbox (set its `maxLength` to 160).
>
> **Good habits:** add a confirmation dialog before sending and a small daily cap, so a stray click can't spam a customer or trip the rate limit. Keep SMS sending behind sign-in.

## 📋 Copy-paste backup — full SMS API PH workflow JSON

Import via **n8n → Workflows → ⋯ menu → Import from File/Clipboard**. After importing, set your **API key** in the HTTP Request node's `x-api-key` header (node versions may differ slightly by n8n release).

```json
{
  "name": "Washify – Laundry Done Notifier",
  "nodes": [
    {
      "parameters": { "httpMethod": "POST", "path": "laundry-done", "responseMode": "responseNode", "options": {} },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 300]
    },
    {
      "parameters": {
        "assignments": { "assignments": [
          { "id": "1", "name": "message", "type": "string", "value": "={{ $json.body.message }}" },
          { "id": "2", "name": "recipient", "type": "string", "value": "={{ '+63' + $json.body.phone.replace(/\\D/g, '').replace(/^0/, '').replace(/^63/, '') }}" }
        ] },
        "options": {}
      },
      "name": "Build Message",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [460, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://smsapiph.onrender.com/api/v1/send/sms",
        "sendHeaders": true,
        "headerParameters": { "parameters": [
          { "name": "x-api-key", "value": "YOUR_API_KEY" }
        ] },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={ \"recipient\": \"{{ $json.recipient }}\", \"message\": \"{{ $json.message }}\" }",
        "options": {}
      },
      "name": "Send SMS (SMS API PH)",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [680, 300]
    },
    {
      "parameters": { "respondWith": "json", "responseBody": "={ \"status\": \"sent\" }", "options": {} },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [900, 300]
    }
  ],
  "connections": {
    "Webhook": { "main": [[{ "node": "Build Message", "type": "main", "index": 0 }]] },
    "Build Message": { "main": [[{ "node": "Send SMS (SMS API PH)", "type": "main", "index": 0 }]] },
    "Send SMS (SMS API PH)": { "main": [[{ "node": "Respond", "type": "main", "index": 0 }]] }
  }
}
```

---

# Part 2 — RAG FAQ Chatbot

**Goal:** a public chat widget that answers questions about a specific shop (hours, pricing, services) using **only** that shop's FAQ — so it never invents policies.

## Step 2.0 — What is RAG (60-second version)

**Retrieval-Augmented Generation** = before the AI answers, you *retrieve* the most relevant facts from your own knowledge base and hand them to the model as context. The model then answers **grounded** in those facts instead of guessing.

Two phases:

1. **Ingest (once / when FAQ changes):** split your FAQ into chunks → turn each into an **embedding** (a vector of numbers) → store in a **vector database**.
2. **Query (every question):** embed the question → find the closest FAQ chunks (vector search) → send question + chunks to the **LLM** → return the answer.

## Step 2.1 — Get a Groq API key

### 📖 Learn

1. Sign in at <https://console.groq.com>.
2. Go to **API Keys → Create API Key**, copy it.
3. In n8n: **Credentials → New → Groq API**, paste the key.

## Step 2.2 — Get a Gemini embeddings key

### 📖 Learn

1. Open <https://aistudio.google.com/app/apikey> and create an API key (free).
2. In n8n: **Credentials → New → Google Gemini (PaLM) API**, paste it.

> We use Groq for *answering* (it's fast and free) and Gemini for *embeddings* (Groq doesn't offer embeddings). Mixing providers like this is normal.

## Step 2.3 — Set up Supabase pgvector

### 📖 Learn

1. Create a free project at <https://supabase.com>.
2. Open the **SQL Editor** and run the setup script (copy-paste below). It:
   - enables the `vector` extension,
   - creates a `documents` table with a `vector(768)` column (768 = Gemini `text-embedding-004` size),
   - creates a `match_documents` function that n8n uses to find similar chunks.
3. In **Project Settings → API**, copy your **Project URL** and **service_role key**.
4. In n8n: **Credentials → New → Supabase API**, paste the host + service role key.

### 📋 Copy-paste backup — Supabase SQL

```sql
create extension if not exists vector;

create table documents (
  id uuid primary key default gen_random_uuid(),
  content text,
  metadata jsonb,
  embedding vector(768)
);

create or replace function match_documents (
  query_embedding vector(768),
  match_count int default null,
  filter jsonb default '{}'
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where documents.metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

## Step 2.4 — Workflow A: Ingest the FAQ (run once)

### 📖 Learn

Build a small workflow to load your FAQ into Supabase:

1. **Manual Trigger** node.
2. A node that provides your FAQ text (e.g., a **Set** node or **Edit Fields** with your FAQ string, or a Google Docs/Drive node later).
3. **Supabase Vector Store** node in **Insert Documents** mode, with two sub-nodes attached:
   - **Embeddings Google Gemini** (model `models/text-embedding-004`)
   - **Default Data Loader** + **Recursive Character Text Splitter** (chunk size ~500) to break the FAQ into pieces.
4. Run it once. Your FAQ is now embedded and stored. Re-run whenever the FAQ changes.

> **Multi-tenant:** tag every FAQ chunk with its shop in the **metadata** field (for example `{ "shop_id": "THE_SHOP_ID" }`). Each shop's chunks live together, so its chatbot only ever retrieves its own FAQ.

### 📋 Copy-paste backup — starter FAQ knowledge base

```text
Happy Wash — FAQ (example: one shop/tenant on Washify)

Hours: Open Monday to Saturday, 8:00 AM to 7:00 PM. Closed Sundays.
Pricing: 220 pesos per load. One load holds up to 8 kg. A load under 8 kg still costs a full 220 pesos.
Turnaround: Standard wash, dry, and fold is ready within 24 hours. Same-day service may be available before 10 AM.
Services: Wash, dry, and fold. We provide detergent and fabric softener.
Payment: We accept cash and GCash.
Notifications: We send an SMS when your laundry is done and ready for pickup.
Pickup: Please bring your claim stub. Unclaimed laundry is kept for 30 days.
Location: Inside the neighborhood; ask staff for directions or call the listed number.
```

## Step 2.5 — Workflow B: Answer questions

### 📖 Learn

This is the live chatbot workflow:

1. **Webhook** node
   - Method `POST`, Path `faq-chat`, Respond `Using Respond to Webhook node`.
   - The app sends `{ question, shopId }` in the POST body so the retriever can scope results to that shop.
2. **Question and Answer Chain** node, with two sub-nodes:
   - **Groq Chat Model** (e.g., model `llama-3.3-70b-versatile`) — the answer generator.
   - **Supabase Vector Store** in **Retrieve (as tool/retriever)** mode, with an **Embeddings Google Gemini** sub-node — the retriever.
   - **Multi-tenant filter:** set the Supabase Vector Store (retriever) metadata filter to the requesting shop, e.g. `{ "shop_id": "THE_SHOP_ID" }`, so it only retrieves that shop's FAQ chunks.
   - Set the chain's input to the incoming question: `{{ $json.body.question }}`.
   - Add a **system prompt** (copy-paste below) so it stays on-topic and grounded.
3. **Respond to Webhook** node — return the chain's answer as JSON.

**Why this shape:** the Q&A Chain automatically embeds the question, queries Supabase for the closest FAQ chunks, and feeds them to Groq with your system prompt — that's RAG end-to-end.

### 📋 Copy-paste backup — system prompt

```text
You are the friendly assistant for a laundry shop on Washify.
Answer ONLY using the provided FAQ context.
If the answer is not in the context, say you are not sure and suggest contacting the shop.
Never invent prices, hours, or policies. Keep answers short and warm.
You may reply in English or Tagalog/Taglish to match the customer.
```

## Step 2.6 — Test & connect

### 📖 Learn

1. Click **Execute workflow**, then send a test question (copy-paste).
2. Try "How much for 3 loads?" — it should answer 660 pesos, grounded in the FAQ.
3. **Activate** the workflow and point your chat widget's `fetch` at the Production URL `/webhook/faq-chat`.

### 📋 Copy-paste backup — test request

```bash
curl -X POST http://localhost:5678/webhook-test/faq-chat \
  -H "Content-Type: application/json" \
  -d '{"question":"What are your hours and how much is one load?","shopId":"THE_SHOP_ID"}'
```

> **Note on the RAG workflow JSON:** the AI/LangChain nodes are version-sensitive, so a pasted JSON export often breaks across n8n versions. For this one I recommend building it node-by-node with the settings above — it's only 4 nodes plus sub-nodes and takes ~10 minutes. The SQL, FAQ, and system prompt above are the parts worth copy-pasting.

---

# Part 3 — Keeping the chatbot and laundry app separate

The chatbot and the laundry operations are **two independent features** sharing one repo + one n8n instance. Separation keeps it clean, private, and easy to explain in an interview.

| Concern | Laundry management | FAQ chatbot |
|---|---|---|
| Audience | Shop owner / staff | Public / customers |
| Access | Behind **Google sign-in** | Open, no login |
| Data | Orders in Supabase (RLS) | FAQ knowledge base only |
| Reads order data? | Yes | **No** (privacy) |
| n8n workflow | `Laundry Done` notifier | Separate `FAQ Chat` workflow |
| Webhook endpoint | `/laundry-done` | `/faq-chat` |
| UI surface | `/app` (auth-gated) | public chat widget / landing |

**Practical rules:**

1. **Two separate n8n workflows**, two separate webhook paths. Never mix them.
2. **The chatbot has no access to the orders table** — it only sees the FAQ vector store (filtered to that shop). This protects customer privacy.
3. **Separate UI surfaces:** the public landing page hosts the chat widget; the staff app lives behind Google sign-in at `/app`.
4. If you ever build a "Where's my laundry?" assistant that *does* read orders, make it a **third, authenticated** workflow — keep it out of the public FAQ bot.

---

# Troubleshooting

- **Webhook 404:** you're using the Test URL but didn't click *Execute workflow*, or you didn't *Activate* for the Production URL.
- **SMS not received:** open the HTTP Request node's output to read the API's response. Confirm the recipient is a valid PH mobile (the Build Message node normalizes `09…`, `63…`, and `+63…` to E.164 `+639XXXXXXXXX`) and that the network is Globe / Smart / DITO. If the response lists `fallback_channels`, SMS failed and it tried email/push instead.
- **400 Bad Request:** the phone isn't valid E.164 (`+639XXXXXXXXX`) or the `message` field is empty. Check the JSON body and the Build Message expressions.
- **401 Unauthorized:** your API key is missing or invalid. Make sure the **`x-api-key`** header is set to your `sk-...` key (it's `x-api-key`, *not* a `Bearer` token).
- **403 Forbidden:** your account may be suspended or your IP blocked — contact SMS API PH support.
- **409 Conflict:** the same message was already processed (idempotency). Don't blindly retry the exact same request.
- **429 / throttled:** you exceeded **1 SMS per 10 seconds** — space out sends or queue them.
- **503 Service Unavailable:** the gateway is temporarily down. Retry with a short backoff; the response may list `fallback_channels` (email/push) it attempted.
- **Links not delivered:** PH telcos (especially Smart) often block shortened URLs — use full URLs in messages (not an issue for a simple "laundry is ready" text).
- **Supabase dimension error:** the table must be `vector(768)` to match Gemini `text-embedding-004`.
- **Chatbot answers off-topic:** re-run the ingest workflow, and tighten the system prompt.

# Cost & limits

- **SMS (SMS API PH):** **free** — no per-message charge and no top-up. The limits are **1 SMS / 10 seconds** (plus email 5/min and push 10/min as fallbacks). It's a donation-funded community service, so be a good citizen: keep messages short and add a daily cap. *For a real production shop later, consider a paid gateway (e.g. PhilSMS or Semaphore) for guaranteed uptime.*
- **Groq:** generous free tier; fine for a demo.
- **Gemini embeddings:** free tier; you embed the tiny FAQ once.
- **Supabase:** free tier database.
