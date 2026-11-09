# Project Handoff: Leaves of Kentucky Store

Single source of truth for the project state. Last updated: 2026-11-09.
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

## Remaining tasks (priority order)
1. **Real test payment** has never been run. `.env.local` needs: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (plus existing Supabase URL/anon key and `ADMIN_EMAIL`). Local webhook test: `stripe listen --forward-to localhost:3000/api/webhook`.
2. **Deploy** (Vercel/Netlify) from `CLEAN_SHOP`: set the same env vars on the host, create a Stripe webhook for `https://<site>/api/webhook` (events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`).
3. **Admin polish**: the "Edit" button does nothing; confirm adding a product with photos works under the new RLS. `AddProductForm` does not set `is_unique`.
4. **Order handling**: `/order-success` clears the cart on any visit (no `session_id` check); there is no `orders` table (shipping address lives only in Stripe); a duplicate payment for an already-sold one-of-a-kind piece is only logged and must be refunded by hand.
5. `npm audit` still reports PostCSS issues bundled inside Next (fix needs Next 16, a breaking change; deliberately skipped, build-time only).
6. Optional: replace the deprecated auth approach with `@supabase/ssr` if server-side auth is ever needed.
