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

## ALSO DEPLOYED ON VERCEL (2026-11-13): https://leaves-of-kentucky.vercel.app
- Owner prefers Vercel long term (will pay $20 Vercel Pro and move the domain there; Hobby plan forbids commercial use). Netlify (free) stays live in parallel. Both sites share the same Supabase DB and auto-deploy from GitHub `main`.
- Vercel project `leaves-of-kentucky` (team "my-infinity-gift"). Env vars (Settings -> Environment Variables, Production): NEXT_PUBLIC_SITE_URL (=https://leaves-of-kentucky.vercel.app), NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ADMIN_EMAIL (Config); SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (Secret). NEXT_PUBLIC_* cannot be Secret. Changing a variable requires Deployments -> Redeploy. No code changes were needed.
- Stripe sandbox has a second webhook destination "Vercel" -> https://leaves-of-kentucky.vercel.app/api/webhook (same two events); its own whsec_ is the Vercel STRIPE_WEBHOOK_SECRET. Supabase Redirect URLs include https://leaves-of-kentucky.vercel.app/**.
- Tested on Vercel 2026-11-13: shop, magic-link login, admin, test purchase, order in Orders tab, webhook 200 — all OK.
- When the domain moves to Vercel: update NEXT_PUBLIC_SITE_URL (Vercel), Stripe webhook URL, Supabase Site URL + Redirect URLs; then retire the Netlify site and its webhook. Live Stripe keys later: new keys + new live webhook secret must be set on Vercel (and Netlify if still alive).

## DEPLOYED (2026-11-10): https://leaves-of-kentucky.netlify.app
- Hosting is **Netlify** (free plan for now; owner plans the ~$9/mo plan for real sales; Vercel Hobby forbids commercial use). Netlify team "MyInfinityGift", project `leaves-of-kentucky`, auto-deploys from GitHub `main` (every push rebuilds the site). Build: `npm run build`, Next.js runtime auto-detected.
- Netlify env vars set: NEXT_PUBLIC_SITE_URL (=https://leaves-of-kentucky.netlify.app), NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (secret), STRIPE_SECRET_KEY (secret), STRIPE_WEBHOOK_SECRET (secret, the Netlify destination's own whsec_), ADMIN_EMAIL. Changing a variable requires Deploys -> Trigger deploy.
- Stripe sandbox "Cobbleline sandbox": webhook destination "Netlify" -> https://leaves-of-kentucky.netlify.app/api/webhook, events checkout.session.completed + checkout.session.async_payment_succeeded, Active, 0% errors. (A separate local listener destination "MyInfinityGift" for localhost exists; not needed.)
- **Live test payment PASSED**: product photos now show on the Stripe page, shipping $12 under $75, webhook marked the piece SOLD on /shop.
- **Categories** (stored lowercase in `products.category`): art shows, bracelets, brooches, earrings, hair pins, jewelry sets, necklaces, pendants, rings (list lives in `src/components/Admin/AddProductForm.tsx` and display order in `src/components/ShopGrid.tsx`). `/shop` has a filter row (`ShopGrid`) showing only categories that contain pieces. The homepage still has its original 4 category cards (earrings, necklaces, bracelets, rings); not changed on purpose (approved design).
- Favicon added (src/app/icon.png, apple-icon.png, favicon.ico; copper flower on dark green).
- Local payment tests #1 and #2 also passed earlier. Local dev webhook (if ever needed): `stripe listen`; if `stripe` is not found in an already-open VS Code, run it by full path: `& "C:\Users\dtebe\AppData\Local\Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe" listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to localhost:3000/api/webhook`.
- Reset a product to available only via SQL Editor (typing in the Table Editor once left a hidden typo in `status`): `update public.products set status='available' where name='...';` then verify `select name, status, length(status) from public.products;` (length must be 9). Test purchases leave pieces `sold`; Willow Leaf Ring and Birch Leaf Earrings may still need resetting.
- Supabase also has unused tables `orders`, `order_items`, `profiles` (not used by the code). Decide later whether to add order tracking in the admin.

## Added 2026-11-11 (after deploy)
- **Orders**: Stripe webhook now saves each paid checkout into table `shop_orders` (SQL in `supabase/orders.sql`, already run); `/admin` has Inventory and Orders tabs (address, items, totals, "Mark as shipped" + tracking). Old tables `orders`, `order_items`, `profiles` are unused.
- **Several admins**: `ADMIN_EMAIL` accepts comma-separated emails (Netlify + `.env.local`), and `public.is_admin()` in Supabase uses an array of emails. A second admin was added to both; the owner has not yet talked to that person to test their login.
- **Our Story page** (`/our-story`, `src/app/our-story/`, scoped `ab-` CSS): Elena Young's text, linked from the header "Our story". Homepage story block now says Elena Young, "6 years of craft", "1 000+ one-of-a-kind pieces" (owner's numbers).
- A standalone single-file preview of the Our Story page (images embedded) was generated outside the repo at `E:\LEAVES_OF_KENTUCKY_STORE\our-story-preview\index.html` so the owner can show it to the shop's boss before the whole site is shown. It is a snapshot: regenerate it if the page changes.
- **Customer emails NOT built yet.** Stripe sends no receipts in test mode, and the site has no "shipped" email. Plan: Resend (owner already has an account) sending (1) order confirmation after payment and (2) "your order has shipped" (with tracking) when "Mark as shipped" is pressed; sender `hello@leavesofkentucky.com`. Blocked: the owner's domain leavesofkentucky.com currently hosts the OLD store, so the domain cannot be verified in Resend yet. Until then Resend can only send to the owner's own address (`onboarding@resend.dev`). The /order-success page already promises "Check your inbox for an order confirmation"; either build emails before launch or soften that text.
- Open question: whether the "Powered by Netlify" badge disappears on the paid plan (Netlify: Project configuration -> General -> Powered by Netlify badge). Owner to check before paying.

## Remaining tasks (priority order)
1. Reset test-sold pieces to `available` (SQL above). Optional: confirm the 409 rejection of an already sold piece at /checkout.
2. **Custom domain** for Netlify (when the owner buys one): update NEXT_PUBLIC_SITE_URL and the Stripe webhook URL, then redeploy.
3. ~~Admin polish~~ DONE (2026-11-11): Edit works (same form as Add), Status select, One-of-a-kind checkbox, add-with-photos verified under RLS, stable list order.
4. **Order handling**: there is no used `orders` table (shipping address lives only in Stripe); a duplicate payment for an already-sold one-of-a-kind piece is only logged and must be refunded by hand.
5. **Replace the legacy Supabase key before early 2027.** Supabase is retiring legacy API keys. `NEXT_PUBLIC_SUPABASE_ANON_KEY` should be swapped for the new **publishable key** (`sb_publishable_...`, Supabase → Project Settings → API Keys), both in `.env.local` and in the Netlify env vars. `SUPABASE_SERVICE_ROLE_KEY` already holds the new **secret key** (`sb_secret_...`). After swapping, re-test login, /admin and /shop.
6. The Stripe keys in use belong to the "Cobbleline sandbox" test account. Before real sales the store needs its own Stripe account and live keys (plus a new live webhook and new STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET on Netlify).
7. `npm audit` still reports PostCSS issues bundled inside Next (fix needs Next 16, a breaking change; deliberately skipped, build-time only).
8. Optional: replace the deprecated auth approach with `@supabase/ssr` if server-side auth is ever needed.
