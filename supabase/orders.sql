-- =====================================================================
-- Leaves of Kentucky: orders table (one row per paid Stripe checkout)
--
-- HOW TO RUN (one time):
--   Supabase -> SQL Editor -> New query -> paste this whole file -> Run
--   (Requires supabase/admin-security.sql to have been run first: it creates public.is_admin().)
--
-- Notes:
--   * The Stripe webhook writes orders with the service-role key (bypasses RLS).
--   * Only admins can read or update orders. Customers and visitors cannot see anything.
--   * We use a NEW table name (shop_orders) so the older, unused tables
--     orders / order_items / profiles are not touched.
-- Safe to run again.
-- =====================================================================

create table if not exists public.shop_orders (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  stripe_session_id text not null unique,
  payment_intent    text,
  customer_email    text,
  customer_name     text,
  customer_phone    text,
  shipping_name     text,
  shipping_address  jsonb,
  items             jsonb not null default '[]'::jsonb,   -- [{ name, quantity, amount }] amounts in cents
  product_ids       text[] not null default '{}',
  subtotal_cents    integer,
  shipping_cents    integer,
  total_cents       integer,
  status            text not null default 'paid' check (status in ('paid', 'shipped')),
  tracking_number   text,
  shipped_at        timestamptz,
  needs_review      boolean not null default false,       -- e.g. a piece was already sold when this payment arrived
  review_note       text
);

alter table public.shop_orders enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'shop_orders' loop
    execute format('drop policy %I on public.shop_orders', p.policyname);
  end loop;
end $$;

create policy "Only admin can view orders" on public.shop_orders
  for select using (public.is_admin());

create policy "Only admin can update orders" on public.shop_orders
  for update using (public.is_admin()) with check (public.is_admin());

create index if not exists shop_orders_created_at_idx on public.shop_orders (created_at desc);
