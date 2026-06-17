-- Washify schema — run once in the Supabase SQL editor.
-- Tables for the relational app data. (The chatbot's vector table is created
-- separately by the n8n tutorial as `documents`.)

create table if not exists public.shops (
  id uuid primary key references auth.users (id) on delete cascade,
  shop_name text not null default 'My Laundry Shop',
  owner_name text,
  pricing_mode text not null default 'per_load', -- 'per_load' | 'per_kg'
  price_per_load numeric not null default 220,
  price_per_kg numeric not null default 25,
  max_kg int not null default 8,
  messenger_page_id text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  order_code text,
  customer_name text not null,
  phone text not null,
  num_loads numeric not null default 1, -- quantity: loads or kg per the shop's pricing_mode
  amount_due numeric not null default 0,
  dropoff_date date not null default current_date,
  status text not null default 'Received',
  paid boolean not null default false,
  texted_at timestamptz,
  messenger_psid text,
  logged_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  name text not null,
  phone text not null,
  visit_count int not null default 1,
  last_visit date not null default current_date
);

create index if not exists orders_shop_id_idx on public.orders (shop_id);
create index if not exists customers_shop_id_idx on public.customers (shop_id);
