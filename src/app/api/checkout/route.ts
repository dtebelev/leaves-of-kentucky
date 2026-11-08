import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia' as any,
});

export async function POST(req: Request) {
  try {
    const { items, email } = await req.json();

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [new URL(item.images[0], process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').toString()],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`,
      customer_email: email,
      metadata: {
        productIds: JSON.stringify(items.map((i: any) => i.id)),
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
