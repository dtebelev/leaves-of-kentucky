-- =====================================================================
-- Leaves of Kentucky: admin security (Row Level Security)
--
-- HOW TO RUN (one time):
--   1. Open your Supabase project -> SQL Editor -> New query
--   2. Paste this whole file
--   3. In STEP 1 below, replace  YOUR_ADMIN_EMAIL@example.com  with the SAME
--      email you use for ADMIN_EMAIL in .env.local (the one you log in with)
--   4. Press Run
--
-- Result:
--   * Everyone can READ products and see product images (the shop works as before)
--   * Only the owner's email can ADD / EDIT / DELETE products and upload images
--   * Stripe webhook keeps working (it uses the service-role key, which bypasses these rules)
-- Safe to run again.
-- =====================================================================

-- STEP 1: who are the admins? (edit the emails inside the array; add more separated by commas)
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = any (array[
    lower('YOUR_ADMIN_EMAIL@example.com'),
    lower('SECOND_ADMIN_EMAIL@example.com')
  ]);
$$;

-- STEP 2: lock the products table
alter table public.products enable row level security;

-- Remove every old policy on products (old "allow all" rules would defeat the new ones)
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'products' loop
    execute format('drop policy %I on public.products', p.policyname);
  end loop;
end $$;

create policy "Anyone can view products" on public.products
  for select using (true);

create policy "Only admin can add products" on public.products
  for insert with check (public.is_admin());

create policy "Only admin can edit products" on public.products
  for update using (public.is_admin()) with check (public.is_admin());

create policy "Only admin can delete products" on public.products
  for delete using (public.is_admin());

-- STEP 3: lock the product-images storage bucket
-- Remove old policies that mention this bucket
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (coalesce(qual, '') ilike '%product-images%' or coalesce(with_check, '') ilike '%product-images%')
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;

create policy "Anyone can view product images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Only admin can upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

create policy "Only admin can change product images" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());

create policy "Only admin can delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- STEP 4 (check): you should see the 4 products policies + 4 product-images policies
select schemaname, tablename, policyname, cmd
from pg_policies
where (schemaname = 'public' and tablename = 'products')
   or (schemaname = 'storage' and tablename = 'objects' and policyname ilike '%product images%')
order by tablename, cmd;
