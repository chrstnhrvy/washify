-- Migration: delete_own_account RPC
-- Allows the currently authenticated user to fully delete their account and
-- all associated data (orders, customers, shop row, then the auth.users row).
-- Cascade foreign keys on the orders/customers tables already handle child
-- rows when the shop is deleted, so we only need to delete the shop row and
-- then the auth user. The function runs with SECURITY DEFINER so it can
-- reach into auth.users (which regular users can't touch directly).

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Delete the shop row; CASCADE will remove orders + customers automatically.
  delete from public.shops where id = auth.uid();

  -- Remove the auth.users row last so the JWT stays valid until this call returns.
  delete from auth.users where id = auth.uid();
end;
$$;

-- Only authenticated users may call this function.
revoke all on function public.delete_own_account() from anon, public;
grant execute on function public.delete_own_account() to authenticated;
