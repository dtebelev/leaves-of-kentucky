import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs'; // signature verification needs the raw body + Node crypto

// Saves one row per paid checkout so the owner can see what to ship and where.
// Idempotent: Stripe retries are ignored thanks to the unique stripe_session_id.
async function recordOrder(
  stripe: Stripe,
  sessionId: string,
  productIds: string[],
  skippedProducts: string[]
) {
  // Re-read the session so the shape is the same no matter which API version the webhook uses.
  const full: any = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
  const shipping = full.shipping_details ?? full.collected_information?.shipping_details ?? null;
  const customer = full.customer_details ?? {};

  const items = (full.line_items?.data ?? []).map((li: any) => ({
    name: li.description,
    quantity: li.quantity,
    amount: li.amount_total,
  }));

  const needsReview = skippedProducts.length > 0;
  const { error } = await getSupabaseAdmin()
    .from('shop_orders')
    .upsert(
      {
        stripe_session_id: sessionId,
        payment_intent: typeof full.payment_intent === 'string' ? full.payment_intent : null,
        customer_email: customer.email ?? null,
        customer_name: customer.name ?? null,
        customer_phone: customer.phone ?? null,
        shipping_name: shipping?.name ?? null,
        shipping_address: shipping?.address ?? null,
        items,
        product_ids: productIds,
        subtotal_cents: full.amount_subtotal ?? null,
        shipping_cents: full.total_details?.amount_shipping ?? null,
        total_cents: full.amount_total ?? null,
        needs_review: needsReview,
        review_note: needsReview
          ? `Already sold or missing when paid: ${skippedProducts.join(', ')}. Possible duplicate payment: check and refund in Stripe if needed.`
          : null,
      },
      { onConflict: 'stripe_session_id', ignoreDuplicates: true }
    );

  if (error) {
    // Throw so we answer 500 and Stripe retries the event later.
    throw new Error(`Failed to record order for session ${sessionId}: ${error.message}`);
  }
  console.log(`Webhook: order recorded for session ${sessionId}`);
}

async function markProductsSold(stripe: Stripe, session: Stripe.Checkout.Session) {
  // Only fulfil when the money has actually been received.
  if (session.payment_status !== 'paid') {
    console.log(`Webhook: session ${session.id} not paid yet (${session.payment_status}), skipping`);
    return;
  }

  const raw = session.metadata?.productIds;
  if (!raw) {
    console.error(`Webhook: session ${session.id} has no productIds metadata`);
    return;
  }

  let productIds: unknown;
  try {
    productIds = JSON.parse(raw);
  } catch {
    console.error(`Webhook: session ${session.id} has malformed productIds metadata`);
    return;
  }
  if (!Array.isArray(productIds) || productIds.some((id) => typeof id !== 'string')) {
    console.error(`Webhook: session ${session.id} has invalid productIds metadata`);
    return;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const skipped: string[] = [];

  for (const id of productIds as string[]) {
    // Conditional update: only flips 'available' -> 'sold'. Safe to run twice
    // (Stripe retries events), so the handler is idempotent.
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ status: 'sold' })
      .eq('id', id)
      .eq('status', 'available')
      .select('id');

    if (error) {
      // Throw so we answer 500 and Stripe retries the event later.
      throw new Error(`Failed to mark product ${id} as sold: ${error.message}`);
    }

    if (data && data.length > 0) {
      console.log(`Webhook: product ${id} marked as sold (session ${session.id})`);
    } else {
      // Already sold (retry, or someone else paid for the same one-of-a-kind piece first),
      // or the product no longer exists. Needs a human to look at it if it's the latter case.
      console.warn(`Webhook: product ${id} was not 'available' for session ${session.id} (already sold or missing). Check for a duplicate payment that may need a refund.`);
      skipped.push(id);
    }
  }

  await recordOrder(stripe, session.id, productIds as string[], skipped);
}

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !endpointSecret) {
    console.error('Webhook: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-10-28.acacia' as any,
  });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    if (!sig) throw new Error('Missing stripe-signature header');
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature error: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await markProductsSold(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      default:
        // Other events are acknowledged and ignored.
        break;
    }
  } catch (err: any) {
    console.error(`Webhook handler error for ${event.type} (${event.id}):`, err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
