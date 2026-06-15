-- Row Level Security — every row is locked to the shop that owns it.
-- A shop's id equals the owner's auth.uid(), so `shop_id = auth.uid()` is the
-- single rule that keeps tenants isolated. Run after schema.sql.

alter table public.shops enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;

-- shops: owner sees and edits only their own row (id = auth.uid())
drop policy if exists shops_select_own on public.shops;
drop policy if exists shops_insert_own on public.shops;
drop policy if exists shops_update_own on public.shops;
create policy shops_select_own on public.shops for select using (id = auth.uid());
create policy shops_insert_own on public.shops for insert with check (id = auth.uid());
create policy shops_update_own on public.shops for update using (id = auth.uid());

-- orders: scoped by shop_id
drop policy if exists orders_all_own on public.orders;
create policy orders_all_own on public.orders for all
  using (shop_id = auth.uid())
  with check (shop_id = auth.uid());

-- customers: scoped by shop_id
drop policy if exists customers_all_own on public.customers;
create policy customers_all_own on public.customers for all
  using (shop_id = auth.uid())
  with check (shop_id = auth.uid());
