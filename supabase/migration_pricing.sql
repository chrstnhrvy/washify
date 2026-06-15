-- Migration: pricing mode (per load / per kg) + first-login onboarding.
-- Safe to run on an existing database (idempotent). Run in the SQL editor.

alter table public.shops
  add column if not exists pricing_mode text not null default 'per_load';
alter table public.shops
  add column if not exists price_per_kg numeric not null default 25;
alter table public.shops
  add column if not exists onboarded boolean not null default false;

-- Allow decimal quantities (e.g. 6.5 kg).
alter table public.orders
  alter column num_loads type numeric;
