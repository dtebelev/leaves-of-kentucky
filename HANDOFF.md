# Project Handoff: Leaves of Kentucky Store

Single source of truth for the project state. Last updated: 2026-11-10.
Repo: https://github.com/dtebelev/leaves-of-kentucky.git (branch `main`). Work directory: `CLEAN_SHOP`.
(`LEAVES-SHOP` is a legacy backup with a corrupted git index; ignore it.)

## Rules for the next agent
- **Design is approved. Do not restyle**: Homepage, Product page, /shop, /checkout, /login, /order-success, cart drawer.
- **Tailwind is NOT wired into the build** (no `postcss.config`, no `@tailwind` in `globals.css`), so Tailwind utility classes do nothing. Do not enable it globally: it would restyle approved pages. New/changed pages use plain CSS scoped by prefix: `adm-` (admin), `lg-` (login), `co-` (checkout), `os-` (order-success), `shp-` (shop spacing).
- The owner is not a programmer: give exact, step-by-step instructions (which folder, which command) and explain in plain Russian.
- Never read or print `.env.local` (secrets). The owner pastes keys into it manually.
- Ask before pushing, merging, deleting or anything outward-facing.

## Stack
Next.js 15.5.29 (App Router), React 19.3, Supabase (table `products`, bucket `product-images`, magic-link auth), Stripe Checkout (hosted page), cart in React Context + localStorage (`leaves-cart-v2`).

## What is done
- **/api/checkout**: trusts only product `id` + `quantity` from the client; name/price/status come from Supabase; rejects sold items; one-of-a-kind pieces limited to qty 1 (only `is_unique === false` allows more); validates email; shipping computed server-side (free from $75, else $12); collects US shipping address; errors are shown on /checkout.
- **/api/webhook**: verifies Stripe signature; on `checkout.session.completed` / `async_payment_succeeded` with `payment_status === 'paid'` marks products `sold` using the server-only service-role client (`src/lib/supabaseAdmin.ts`); conditional + idempotent; returns 500 on DB failure so Stripe retries.
- **Admin** (`/admin`): only the owner (`ADMIN_EMAIL`) passes `/api/admin/check`; real protection is RLS in `supabase/admin-security.sql` (already run by the owner; 8 policies confirmed). Admin layout uses scoped `adm-*` CSS.
- Test carousel images removed from the product page (carousel works when a product has 2+ real images).
- `/shop` is `force-dynamic` (inventory must not be frozen at build time). `next.config.mjs` allows Supabase Storage images.
- Hydration warning "fdprocessedid" in dev is caused by a browser extension, not a bug.

- **Test payment #1 PASSED (2026-11-10)**: two pieces, $132, free shipping, US address collected, `checkout.session.completed` received, both products became `sold` in /shop and /admin. Products were then reset to `available` via SQL.
- **/order-success** now clears the cart only after `/api/order-status?session_id=...` confirms `payment_status === 'paid'` (commit f980ec6). Product page text fixed to "Complimentary shipping on orders over $75" (was wrongly "all pieces").

## UPDATE: test payment #2 PASSED (2026-11-10, 20:53)
Willow Leaf Ring alone: Stripe page showed shipping $12.00, total $48.00, US address; `stripe listen` showed `[200]`; cart emptied on /order-success; product became SOLD OUT on /shop. Willow Leaf Ring is still `sold` in the DB: reset it with the SQL below if the catalog should be restored. The whole local payment flow is verified; next big step is deploy. The section below is the older stopping-point note (kept for the commands).

## Where we stopped (2026-11-10, owner stepped away ~2 hours)
- `npm run dev` and `stripe listen` were both running in VS Code terminals. The owner was about to make **test payment #2**: add Willow Leaf Ring ($36) alone, expect shipping $12.00 and total $48.00 on the Stripe page, pay with 4242 4242 4242 4242, then check: cart empties on the success page, `stripe listen` shows `[200]`, Willow Leaf Ring becomes SOLD OUT on /shop. Result not yet reported. After that test, reset the product to `available` (SQL below).
- If `stripe listen` is closed, the `stripe` command is NOT on PATH in the already-open VS Code; run by full path: `& "C:\Users\dtebe\AppData\Local\Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe" listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to localhost:3000/api/webhook`. (A new VS Code window will find plain `stripe`.)
- Reset a product to sold/available only via SQL Editor (typing in the Table Editor once left a hidden typo in `status`, so the shop kept showing SOLD OUT): `update public.products set status='available' where name='...';` then verify with `select name, status, length(status) from public.products;` (length must be 9).
- Git: local commits not yet pushed: 3d53464 and f980ec6 (plus this HANDOFF update). Ask the owner before pushing.
- Stripe test purchases show empty images on the Stripe page because product image paths are relative (`/assets/xxx.webp`) and Stripe cannot reach `localhost`. Expected to work once deployed with a real `NEXT_PUBLIC_SITE_URL`; verify after deploy.
- Supabase also has unused tables `orders`, `order_items`, `profiles` (not used by the code). Decide later whether to add order tracking in the admin.

## Remaining tasks (priority order)
1. Finish test payment #2 (see above). Optional: confirm the 409 rejection of an already sold piece at /checkout.
2. **Deploy** (Vercel/Netlify) from `CLEAN_SHOP`: set the same env vars on the host, create a Stripe webhook for `https://<site>/api/webhook` (events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`).
3. **Admin polish**: the "Edit" button does nothing; confirm adding a product with photos works under the new RLS. `AddProductForm` does not set `is_unique`.
4. **Order handling**: there is no used `orders` table (shipping address lives only in Stripe); a duplicate payment for an already-sold one-of-a-kind piece is only logged and must be refunded by hand.
5. **Replace the legacy Supabase key before early 2027.** Supabase is retiring legacy API keys. `NEXT_PUBLIC_SUPABASE_ANON_KEY` should be swapped for the new **publishable key** (`sb_publishable_...`, Supabase → Project Settings → API Keys), both in `.env.local` and in the hosting env vars at deploy time. `SUPABASE_SERVICE_ROLE_KEY` already holds the new **secret key** (`sb_secret_...`). After swapping, re-test login, /admin and /shop.
6. The Stripe keys in use belong to the "Cobbleline sandbox" test account. Before real sales the store needs its own Stripe account and live keys.
7. `npm audit` still reports PostCSS issues bundled inside Next (fix needs Next 16, a breaking change; deliberately skipped, build-time only).
8. Optional: replace the deprecated auth approach with `@supabase/ssr` if server-side auth is ever needed.
