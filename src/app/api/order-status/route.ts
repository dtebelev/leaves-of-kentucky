import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

// Tells the order-success page whether a Checkout Session was really paid.
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get('session_id');
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ paid: false }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return NextResponse.json({ paid: false }, { status: 500 });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2024-10-28.acacia' as any });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({ paid: session.payment_status === 'paid' });
  } catch (err) {
    console.error('order-status: could not retrieve session', err);
    return NextResponse.json({ paid: false }, { status: 404 });
  }
}
