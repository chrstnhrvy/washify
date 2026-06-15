# Washify — Knowledge Base

This document is the knowledge source for the Washify FAQ assistant. It
describes **what Washify is and everything it can do**. It is written about the
app in general, so anything that varies between shops (exact prices, opening
hours, address, contact details) is described as something **each shop sets for
itself**, not with fixed numbers.

> To use this as the chatbot's knowledge: paste this text into the n8n
> **washify-faq** ingest workflow's text node and run it once to embed it. See
> [n8n-automation-tutorial.md](n8n-automation-tutorial.md).

---

## What is Washify?

Washify is a web app that laundry shops use to run their day-to-day business. A
shop owner signs in, tracks every order, notifies customers by SMS when their
laundry is ready, sees how sales are doing, and lets customers ask questions
through an AI assistant. It is built so that many shops can use it at once, each
with its own private, separate account.

Washify is designed for laundry shops in the Philippines: it supports peso
pricing, common local phone number formats, and a free SMS gateway, and the
assistant can reply in English or Tagalog.

---

## How shops get started

- **Sign in with Google.** Owners log in with a Google account. There are no
  separate passwords to manage, and the first sign-in automatically creates the
  shop's private workspace.
- **First-login setup.** The very first time an owner signs in, Washify asks
  them to set up their shop: the **shop name**, how they **charge** (per load or
  per kilo), and their **price**. All of this can be changed later in Settings.
- **One workspace per owner.** Each owner sees only their own shop. No shop can
  ever see another shop's orders, customers, or sales.

---

## Pricing models

Each shop chooses how it charges, and sets its own price. Washify supports two
pricing modes:

- **Per load** — a flat price for each wash load.
- **Per kilo** — a price for every kilogram of laundry (kilos can include
  halves, like 6.5 kg).

When staff add an order, Washify multiplies the quantity by the shop's price and
fills in the amount due automatically. Exact rates differ from shop to shop, so
for a specific price a customer should ask that shop.

---

## Orders and the status pipeline

- **Add an order** with the customer's name, phone number, and the quantity
  (loads or kilos). Washify calculates the amount due and assigns a unique
  **order code** (for example WSH-0001).
- **Status pipeline.** Every order moves through four clear stages:
  **Received → Washing → Ready → Picked up.** Staff update the status with one
  tap as the laundry progresses.
- **Paid / Unpaid.** Each order can be marked paid or unpaid, so there's never
  confusion about who still owes money.
- **Search and filter.** Staff can find an order by customer name or phone
  number, or filter the list by status.

---

## Customer SMS notifications

- **Text Customer button.** When an order is ready, staff tap **Text Customer**
  and Washify sends a real SMS to the customer's phone letting them know their
  laundry is done and ready for pickup.
- **No app needed by the customer.** It's a normal text message, so it works on
  any phone with no app to install and nothing to sign up for.
- **Editable message.** The message is pre-filled (for example, "Hi [name].
  Your laundry is done.") and staff can reword it. It's kept to 160 characters
  so it sends as a single SMS, and there's a confirmation step before it sends.
- **Powered by automation.** Sending runs through an n8n automation that tidies
  the phone number into the correct Philippine format and delivers the SMS.

---

## Sales dashboard and Excel export

- **Sales views.** Owners can see totals by **day, week, or month**: total
  revenue, total loads or kilos, and number of orders.
- **Charts.** Simple bar charts show revenue per day and loads (or kilos) per
  day across the chosen period.
- **Excel export.** One click downloads the chosen period's orders as an
  `.xlsx` spreadsheet (customer, phone, quantity, amount, status, paid,
  drop-off date), so owners can keep records or do their own reporting.

---

## Settings

Owners can update their shop at any time in **Settings**: the shop name, the
pricing mode (per load or per kilo), and the price. Changes apply right away to
new orders and the dashboard labels.

---

## Privacy and data isolation

- Each shop's data is **completely separate**. The system enforces this at the
  database level, so a shop only ever sees its own orders, customers, and sales.
- The separation does not depend on the app behaving correctly; it is guaranteed
  by database security rules.
- Customer details and laundry history are kept private to the shop they belong
  to.

---

## The FAQ assistant (this chatbot)

- It answers questions about Washify and about the shop, using only the shop's
  own knowledge base. It does not invent prices, hours, or policies. If it
  isn't sure, it says so and suggests contacting the shop.
- It **cannot see order data** (who dropped off what). It only knows this FAQ.
  A "where is my laundry?" lookup would be a separate, signed-in feature.
- It can reply in English or Tagalog/Taglish to match the customer.

---

## Questions and answers

### Using Washify (for shop owners and staff)

- **How do I sign in?**
  Sign in with your Google account. Your private shop workspace is created
  automatically the first time.
- **How do I set up my shop?**
  On your first sign-in, Washify asks for your shop name, how you charge (per
  load or per kilo), and your price. You can change these later in Settings.
- **Can I charge per kilo instead of per load?**
  Yes. Washify supports both per-load and per-kilo pricing, and you choose which
  to use. Per-kilo orders can include half kilos.
- **How do I add an order?**
  Enter the customer's name, phone, and the quantity (loads or kilos). Washify
  calculates the amount and creates an order code for you.
- **How do the order statuses work?**
  Orders move through Received, Washing, Ready, and Picked up. You change the
  status with one tap as the laundry progresses.
- **How do I tell a customer their laundry is ready?**
  Tap Text Customer on the order. Washify sends them an SMS. You can edit the
  message first, and you confirm before it sends.
- **How do I see how much I've earned?**
  Open the Sales page and switch between Day, Week, and Month to see revenue,
  loads or kilos, and order counts, with charts.
- **Can I export my sales?**
  Yes. The Sales page has an Export button that downloads the selected period as
  an Excel (.xlsx) file.
- **How do I change my price or shop name?**
  Open Settings and update the shop name, pricing mode, or price. Changes take
  effect immediately.
- **Can more than one shop use Washify?**
  Yes. Every owner has their own private workspace and can never see another
  shop's data.
- **Is my shop's data private?**
  Yes. Data is isolated per shop and protected by database security rules, so
  only you can see your orders, customers, and sales.
- **What does Washify cost?**
  Washify runs on free tiers and is free to use.

### About a shop (for customers)

- **Will I be told when my laundry is ready?**
  Yes. The shop sends you an SMS when your order is marked ready for pickup.
- **Do I need an app to get the text?**
  No. It's a normal SMS, so any phone receives it with nothing to install.
- **How can I check on my order?**
  Ask the shop. Staff can look up your order by your name or phone number if you
  lose your claim ticket.
- **How much does laundry cost / what are your hours / where are you?**
  These are set by each shop, so please ask the shop directly. Pricing may be
  per load or per kilo depending on the shop.
- **How do I pay?**
  Payment methods are set by each shop, so please ask the shop for the options
  they accept.

---

## What the assistant will not do

- It will not make up prices, hours, addresses, or policies that aren't in the
  shop's knowledge base. If it doesn't know, it says so.
- It cannot read live order data. It only knows the information in this FAQ.
