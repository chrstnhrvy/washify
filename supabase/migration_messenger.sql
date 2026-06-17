-- Migration: Facebook Messenger channel.
-- Stores each customer's Page-Scoped ID (PSID) so the app can notify them on
-- Messenger. Safe to run on an existing database. Run in the SQL editor.

alter table public.orders
  add column if not exists messenger_psid text;
alter table public.customers
  add column if not exists messenger_psid text;

-- The shop's Facebook Page ID, used to build the m.me connect link/QR.
alter table public.shops
  add column if not exists messenger_page_id text;
