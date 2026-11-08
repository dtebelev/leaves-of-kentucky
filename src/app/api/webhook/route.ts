import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs'; // signature verification needs the raw body + Node crypto

async function markProductsSold(session: Stripe.Checkout.Session) {
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
    }
  }
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
        await markProductsSold(event.data.object as Stripe.Checkout.Session);
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
