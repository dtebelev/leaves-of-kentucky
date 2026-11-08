import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error('Missing signature or endpoint secret');
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve line items to get product IDs
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    // For each item, mark as sold in Supabase if it's unique
    // We assume the product name or metadata was used to link back
    // Better: use session metadata to pass product IDs
    const items = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'metadata'],
    });

    const productIdsString = items.metadata?.productIds;
    if (productIdsString) {
      const productIds = JSON.parse(productIdsString);

      for (const id of productIds) {
        const { error } = await supabase
          .from('products')
          .update({ status: 'sold' })
          .eq('id', id);

        if (error) {
          console.error(`Error updating product ${id}:`, error);
        } else {
          console.log(`Product ${id} marked as sold`);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
