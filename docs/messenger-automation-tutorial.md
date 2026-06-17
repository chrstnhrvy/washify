# 🫧 Washify — Facebook Messenger Automation Tutorial

This guide adds a **Facebook Messenger** notification channel to Washify with
n8n, alongside the SMS notifier. When an order is ready, the shop's Facebook
Page sends the customer a Messenger message.

It follows the same shape as the SMS workflow: `Webhook → Build → Send → Respond`.

## How to use this guide

Every step has two parts:

- **📖 Learn (do it yourself):** the manual steps so you understand what's happening.
- **📋 Copy-paste backup:** ready-made config / JSON for when you're racing the clock.

---

## ⚠️ Read this first — Messenger is not like SMS

SMS lets you text **any phone number, cold**. Messenger does **not**. Meta's
platform policy means:

- You can only message a person who has **messaged your Page first** (they opt in).
- You identify them by a **PSID** (Page-Scoped ID), *not* a phone number or name.
- You can reply freely for **24 hours** after their last message. Outside that
  window you must attach an approved **message tag** (for "your order is ready,"
  use `POST_PURCHASE_UPDATE`).

**What this means for Washify:** each customer must message the shop's Page once
(e.g. scan an `m.me` QR code at the counter). That interaction gives you their
PSID, which you store and later notify. This tutorial covers (1) capturing the
PSID and (2) sending the notification.

---

## Prerequisites

- **n8n** running (same instance as the SMS workflow) → see
  [n8n-automation-tutorial.md](n8n-automation-tutorial.md) Part 0.
- A **Facebook Page** for the shop (create one at <https://facebook.com/pages/create>).
- A **Meta for Developers** account → <https://developers.facebook.com>.
- Your n8n must be reachable over **HTTPS** for Meta's webhook (use your public
  Oracle Cloud URL, or a tunnel like ngrok for local testing — Meta won't call
  `http://localhost`).

---

# Part 1 — Create a Meta app with Messenger

### 📖 Learn

1. Go to <https://developers.facebook.com/apps> → **Create app**.
   - *Why:* a Meta "app" is the API project that holds your Messenger
     credentials and permissions. Every Graph API call is made *by* an app.
2. Pick use case **"Other" → Business**, name it (e.g. `Washify`).
   - *Why:* the Business type is the one that exposes the Messenger product and
     Page-messaging permissions; the other types don't.
3. In the app dashboard, **Add product → Messenger → Set up**.
   - *Why:* this bolts the Messenger API onto your app, unlocking the **Send
     API** (for sending) and the **Webhooks** settings (for receiving).
4. Under **Messenger → Settings → Access Tokens**, click **Add or remove Pages**
   and connect the shop's Facebook Page.
   - *Why:* messages are sent **as a Page**, never as your personal profile.
     Linking the Page is what lets your app act on its behalf.
5. Next to the connected Page, click **Generate** to create a **Page Access
   Token**. Copy it — this is what authorizes sending. Keep it secret.
   - *Why:* this token is attached to every Send API call and proves "this app
     is allowed to message as this Page." It's the Messenger equivalent of your
     SMS `x-api-key`.

> The Page Access Token is the Messenger equivalent of your SMS `x-api-key`.
> Store it only in n8n, never in the repo (the workflow JSON below uses a
> placeholder).

---

# Part 2 — Capture the customer's PSID (inbound webhook)

Meta sends every message your Page receives to a **webhook**. You use this to
learn each customer's PSID. Setup has two phases: a one-time **verification**
(GET) and the ongoing **message events** (POST), both on the same URL.

## Step 2.1 — Build the verification + receiver in n8n

### 📖 Learn

Meta sends two different kinds of request to the **same URL**: a one-time **GET**
to verify the webhook, then ongoing **POST**s for messages. You handle them with
**two separate chains in one workflow**. The chains are **independent — they do
NOT connect to each other.** Each starts from its own Webhook trigger; n8n runs
whichever chain matches the incoming request's HTTP method.

```
Chain A (Meta's GET):    [Verify (GET)] ───▶ [Return Challenge]
Chain B (Meta's POST):   [Incoming (POST)] ─▶ [Extract PSID] ─▶ [Supabase upsert]  (optional)

         ▲ these two chains are NOT linked — nothing connects A to B ▲
```

> **Why two webhooks on one path is allowed:** n8n lets multiple Webhook nodes
> share the same path as long as their HTTP **methods differ** (GET vs POST). A
> workflow can have more than one trigger; both go live when you Activate it.

#### Chain A — verification (2 nodes, connected to each other)

1. Add a **Webhook** node, rename it `Verify`:
   - HTTP Method: `GET`
   - Path: `messenger`
   - Respond: `Using 'Respond to Webhook' node`
   - *Why:* Meta's verification is a **GET** request, so this node only listens
     for GETs. "Respond using a node" lets you control exactly what's returned
     (the next node), which the verification requires.
2. Add a **Respond to Webhook** node, rename it `Return Challenge`:
   - Respond With: `Text`
   - Response Body: `{{ $json.query['hub.challenge'] }}`
   - *Why:* Meta puts a random `hub.challenge` value in the URL query and expects
     you to echo it back as **plain text**. Returning it proves you control this
     URL. (JSON would fail — Meta wants the raw value.)
3. **Connect them:** drag from `Verify`'s right-side output dot into
   `Return Challenge`'s left-side input dot. Chain A is now `Verify → Return Challenge`.
   - *Why:* the webhook node receives the request, then hands it to the respond
     node that sends the challenge back. Without the connection, nothing replies
     and verification fails.

> Optional hardening: drop an **IF** node between them that proceeds only when
> `{{ $json.query['hub.verify_token'] }}` equals the verify token you'll set in
> Step 2.2.

#### Chain B — incoming messages (separate, starts from its own trigger)

4. Add a **second Webhook** node, rename it `Incoming`:
   - HTTP Method: `POST`
   - Path: `messenger` (yes, the same path as `Verify`)
   - Respond: `Immediately`
   - Leave its output **unconnected to Chain A** — start a fresh chain here.
   - *Why:* once verified, Meta delivers every customer message as a **POST** to
     the same URL. This node catches those. "Respond Immediately" sends Meta a
     fast `200 OK` so it knows delivery succeeded — Meta only needs the
     acknowledgement, not a data response.
5. Add an **Edit Fields (Set)** node, rename it `Extract PSID`, with two string
   fields in expression mode:
   - `psid` → `{{ $json.body.entry[0].messaging[0].sender.id }}`
   - `text` → `{{ $json.body.entry[0].messaging[0].message.text }}`
   - *Why:* Meta's POST body is deeply nested JSON. The `sender.id` buried inside
     is the **PSID** — the only handle you'll ever have for messaging that person
     back. This node pulls it (and their message text) out into clean fields.
6. **Connect** `Incoming → Extract PSID`.
   - *Why:* feeds the raw incoming event into the node that extracts the PSID.
7. *(Optional, for real use)* add a **Supabase** node in **Update/Upsert** mode
   and connect `Extract PSID → Supabase` to save the PSID onto the matching
   customer (see Part 4). For a demo you can stop at step 6 and read the PSID
   from the node's execution output.
   - *Why:* a PSID is only useful if you remember it. Storing it on the customer
     row lets you later look them up and send the "laundry done" message.

**So, to answer the connection question directly:** `Verify → Return Challenge`
are connected (Chain A). `Incoming → Extract PSID → Supabase` are connected
(Chain B). **Chain A and Chain B are not connected to each other** — they're two
parallel flows triggered by different request types on the same path.

## Step 2.2 — Register the webhook with Meta

### 📖 Learn

1. **Messenger → Settings → Webhooks → Add Callback URL**.
   - *Why:* this is where you tell Meta the address to send verification and
     messages to. It points at the n8n webhook you just built.
2. **Callback URL:** your n8n production URL, e.g.
   `https://your-n8n-host/webhook/messenger`.
   - *Why:* must be the **production** URL (not the `/webhook-test/` one) and
     must be **HTTPS** — Meta refuses plain HTTP and won't reach `localhost`.
3. **Verify token:** any secret string you choose (e.g. `washify-verify-123`).
   Meta sends it as `hub.verify_token`; for a hardened setup, add an **IF** node
   that checks it before echoing the challenge.
   - *Why:* it's a shared password between you and Meta. Meta sends it on the
     verification GET so your workflow can confirm the request is genuinely from
     Meta before trusting it.
4. Click **Verify and Save** — n8n's GET webhook returns the challenge and Meta
   confirms.
   - *Why:* this is the moment Meta fires the one-time GET. Chain A echoes the
     challenge back; a match is Meta's proof that you own the URL, so it saves it.
5. Under **Webhook fields**, subscribe to **`messages`**.
   - *Why:* Meta only forwards the event types you subscribe to. Without
     `messages`, incoming customer messages never reach n8n and you capture no PSIDs.
6. Back in **Access Tokens**, make sure the Page is **subscribed** to the app.
   - *Why:* this links that specific Page's events to your app. Otherwise the
     Page's messages have nowhere to be delivered.

> Activate (publish) the n8n workflow before clicking Verify, so the production
> URL is live.

## Step 2.3 — Auto-link the PSID to an order (code-in-message)

### 📖 Learn

A raw PSID is useless unless you know *which order* it belongs to. Meta's `m.me?ref=`
referral links can carry an order id, but referral events are **unreliable**
(they need extra webhook subscriptions and only fire in narrow cases). The robust
signal is the one that always arrives: the **message text**. So the customer
sends the **order code**, and you match on that.

The Washify app shows this on each order (Notify modal → Messenger tab): a QR to
open a chat with the Page, plus the order code (e.g. `WSH-0002`) to send.

Extend **Chain B** so it becomes `Incoming → Extract PSID → Link to Order`:

1. In **Extract PSID**, add a field that normalizes the message text into a code:
   - `code` → `{{ ($json.body.entry[0].messaging[0].message?.text || '').trim().toUpperCase() }}`
   - *Why:* this rides the `messages` event (always delivered), trims spaces, and
     upper-cases so `wsh-0002` matches `WSH-0002`. Non-text events resolve to an
     empty string, which simply matches no order (safe no-op).
2. Add a **Supabase** node, rename it `Link to Order`, and connect
   `Extract PSID → Link to Order`. Set it to:
   - **Operation:** Update
   - **Table:** `orders`
   - **Filter / Select Conditions:** `order_code` `equals` `{{ $json.code }}`
   - **Field to update:** `messenger_psid` = `{{ $json.psid }}`
   - **Credential:** your existing **Supabase account** (service role).
   - *Why:* it writes the PSID onto the order whose code the customer sent. The
     service-role credential lets the update bypass RLS. A code that matches no
     order updates zero rows — no error.
3. **Re-publish** the inbound workflow.

> Only `messages` needs to be subscribed for this (no `messaging_referrals` /
> `messaging_postbacks`). The importable `n8n/n8n-fb-message.json` already
> includes this `Link to Order` node — after importing, open it and confirm the
> table, filter, field, and credential, since the Supabase node's settings shift
> between n8n versions.

> **Note on uniqueness:** order codes (`WSH-0001`) are per-shop, so for a true
> multi-shop deployment you'd match on a globally-unique token instead. For a
> single-shop demo, the order code is fine.

Now the flow is reliable: customer scans the QR → sends the order code → n8n
writes their PSID onto that order → staff reopen it and the PSID is filled in.

---

# Part 3 — Send the "laundry is done" message

**Flow:** `Webhook (POST /messenger-send) → Build → HTTP Request (Send API) → Respond`

## Step 3.1 — Build the workflow

### 📖 Learn

This is a single straight chain: `Webhook → Send Messenger → Respond`
(all three connected left to right).

1. **Webhook** node — Method `POST`, Path `messenger-send`,
   Respond `Using Respond to Webhook node`. The app sends `{ psid, message }`.
   - *Why:* this is the door your Washify app knocks on. When staff tap "Text via
     Messenger," the app POSTs the customer's PSID and the message text here.
2. **HTTP Request** node — name it `Send Messenger`:
   - Method: `POST`
   - URL: `https://graph.facebook.com/v21.0/me/messages`
   - **Headers** (Send Headers = on): `Authorization` → `Bearer YOUR_PAGE_ACCESS_TOKEN`
   - **Body** (Send Body = on, JSON):
     ```json
     {
       "recipient": { "id": "{{ $json.body.psid }}" },
       "messaging_type": "RESPONSE",
       "message": { "text": "{{ $json.body.message }}" }
     }
     ```
   - *Why each part:*
     - **URL** is Meta's Send API — the endpoint that actually delivers the message.
     - **Authorization: Bearer <token>** proves the call may message as your Page.
     - **`recipient.id`** is the PSID (who to send to); **`message.text`** is what
       to send — both pulled from the request the app sent.
     - **`messaging_type: RESPONSE`** means "I'm replying within the 24-hour
       window since the customer last messaged." This needs no tag and no review.
3. **Respond to Webhook** node — return `{ "status": "sent" }`.
   - *Why:* sends a small confirmation back to the app so it knows the send
     succeeded and can show a ✓ (mirrors the SMS workflow's response).

> **About message tags (important):** Meta has **deprecated the old message tags**
> like `POST_PURCHASE_UPDATE` — sending with one now fails with *"Deprecated
> Message Tag Not Allowed."* Inside the 24-hour window use `"messaging_type":
> "RESPONSE"` (above). To notify **outside** 24h, Meta now requires an approved
> **utility message template**, which needs extra setup/review — so for this
> project, send the "ready for pickup" message while the customer is still within
> 24h of their drop-off message.

## Step 3.2 — Test it

### 📖 Learn

1. Message the shop's Page from your own Facebook account (this opts you in and
   creates your PSID). Find your PSID in the Part 2 execution.
   - *Why:* you can't send to someone who hasn't messaged the Page first, and you
     need a real PSID to test with. Messaging the Page yourself creates yours.
2. **Execute workflow** to arm the test URL, then send a test request:
   - *Why:* the test URL (`/webhook-test/`) only listens for one call right after
     you click Execute. It lets you try the flow before going live.

### 📋 Copy-paste backup — test request

```bash
curl -X POST http://localhost:5678/webhook-test/messenger-send \
  -H "Content-Type: application/json" \
  -d '{"psid":"YOUR_PSID","message":"Hi! Your laundry is done and ready for pickup."}'
```

3. Check Messenger on your phone. 🎉 Then **Activate** the workflow for the
   permanent production URL.

## 📋 Copy-paste backup — full Messenger send workflow JSON

Import via **n8n → Workflows → ⋯ → Import from File/Clipboard**. After importing,
set your **Page Access Token** in the HTTP Request node's `Authorization` header.

```json
{
  "name": "Washify – Messenger Notify",
  "nodes": [
    {
      "parameters": { "httpMethod": "POST", "path": "messenger-send", "responseMode": "responseNode", "options": {} },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://graph.facebook.com/v21.0/me/messages",
        "sendHeaders": true,
        "headerParameters": { "parameters": [
          { "name": "Authorization", "value": "Bearer YOUR_PAGE_ACCESS_TOKEN" }
        ] },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={ \"recipient\": { \"id\": \"{{ $json.body.psid }}\" }, \"messaging_type\": \"RESPONSE\", \"message\": { \"text\": \"{{ $json.body.message }}\" } }",
        "options": {}
      },
      "name": "Send Messenger",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [460, 300]
    },
    {
      "parameters": { "respondWith": "json", "responseBody": "={ \"status\": \"sent\" }", "options": {} },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [680, 300]
    }
  ],
  "connections": {
    "Webhook": { "main": [[{ "node": "Send Messenger", "type": "main", "index": 0 }]] },
    "Send Messenger": { "main": [[{ "node": "Respond", "type": "main", "index": 0 }]] }
  }
}
```

---

# Part 4 — Connect the Washify app

Messenger needs a **PSID**, not a phone number, so the app stores it per customer
once captured (Part 2).

## Step 4.1 — Store the PSID (schema)

Add a column to keep each customer's Messenger ID:

```sql
alter table public.customers add column if not exists messenger_psid text;
alter table public.orders   add column if not exists messenger_psid text;
```

- *Why:* a PSID is the only way to message someone on Messenger, so it has to be
  saved somewhere tied to the customer/order. Without it, the send workflow has
  no recipient.

In the Part 2 receiver, upsert the PSID onto the customer (match by the name they
send, or have them send a code shown on their claim stub).

- *Why:* you need a way to connect "this PSID" to "this customer." The cleanest
  trick is to print a short code on the claim stub and ask them to send it to the
  Page; the receiver then matches the code to the order and saves the PSID.

## Step 4.2 — Add a typed client call

Mirror `sendSms` in [src/lib/n8n.ts](../src/lib/n8n.ts):

```ts
/** Notify a customer via the shop's Facebook Page (requires their PSID). */
export function sendMessenger(psid: string, message: string) {
  return postWebhook<{ status: string }>("messenger-send", { psid, message });
}
```

- *Why:* keeping all webhook calls in one typed client means the rest of the app
  calls `sendMessenger(...)` without knowing the URL or payload shape — the same
  pattern as `sendSms`, so the two channels stay consistent and easy to swap.

## Step 4.3 — Offer it as a channel

In the order row / Text Customer modal, show **Messenger** as an option only when
the order has a `messenger_psid`; otherwise fall back to SMS. That's the
multi-channel pattern: same webhook-relay shape, different delivery node.

- *Why:* not every customer will have opted into Messenger, but every order has a
  phone. Showing Messenger only when a PSID exists (and defaulting to SMS
  otherwise) means staff always have a working way to notify the customer.

---

# Troubleshooting

- **Webhook won't verify:** n8n must be on **HTTPS** and the workflow **active**;
  the GET Respond node must return `{{ $json.query['hub.challenge'] }}` as **Text**.
- **"Deprecated Message Tag Not Allowed" (code 100, subcode 1893061):** you sent
  with an old `tag`. Tags are deprecated — within 24h use `"messaging_type":
  "RESPONSE"` and no tag; outside 24h you need an approved utility template.
- **(#10) "message sent outside allowed window":** the 24h window closed — the
  customer must message the Page again, or you must use an approved utility template.
- **(#100)/"No matching user found":** the PSID is wrong, or that user never
  messaged this Page. PSIDs are unique per Page — a PSID from another app won't work.
- **(#200) permissions error:** the Page isn't subscribed to the app, or the
  token lacks `pages_messaging`. Re-generate the Page Access Token.
- **190 / token expired:** regenerate the Page Access Token (use a long-lived /
  system-user token for production).
- **Nothing received in n8n:** confirm you subscribed to the **`messages`**
  webhook field and the Page is linked under Access Tokens.

# Cost & limits

- **Messenger:** free to send. The real limits are **policy**, not price: opt-in
  required, the **24-hour** window, and approved **message tags** for anything
  outside it. Don't use tags for promotions — that risks the Page being
  restricted.
- **vs SMS:** SMS reaches anyone instantly (great for cold "ready" texts);
  Messenger is free and richer but requires the customer to engage first. Many
  shops offer **both** and let the customer pick.
