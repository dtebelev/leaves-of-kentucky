import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const MAX_LINE_ITEMS = 10; // Stripe metadata values are limited to 500 chars
const MAX_QUANTITY_NON_UNIQUE = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class CheckoutError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error('STRIPE_SECRET_KEY is not configured');
      throw new CheckoutError('Payments are temporarily unavailable.', 500);
    }
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-10-28.acacia' as any,
    });

    const body = await req.json().catch(() => null);
    const rawItems = body?.items;
    const email = typeof body?.email === 'string' ? body.email.trim() : '';

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new CheckoutError('Your bag is empty.');
    }
    if (!EMAIL_RE.test(email)) {
      throw new CheckoutError('Please enter a valid email address.');
    }

    // Trust ONLY product id + quantity from the client. Merge duplicates.
    const requested = new Map<string, number>();
    for (const raw of rawItems) {
      const id = typeof raw?.id === 'string' ? raw.id : '';
      const qty = Number(raw?.quantity);
      if (!id || !Number.isInteger(qty) || qty < 1) {
        throw new CheckoutError('Invalid item in your bag.');
      }
      requested.set(id, (requested.get(id) ?? 0) + qty);
    }
    if (requested.size > MAX_LINE_ITEMS) {
      throw new CheckoutError(`Please check out at most ${MAX_LINE_ITEMS} different pieces at a time.`);
    }

    // Load the authoritative product data (name, price, status) from the database.
    const ids = Array.from(requested.keys());
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('id, name, price, images, status, is_unique')
      .in('id', ids);

    if (dbError) {
      console.error('Checkout: failed to load products', dbError);
      throw new CheckoutError('Could not verify your bag. Please try again.', 500);
    }

    const byId = new Map((products ?? []).map((p: any) => [p.id, p]));
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const lineItems = ids.map((id) => {
      const product: any = byId.get(id);
      if (!product) {
        throw new CheckoutError('One of the pieces in your bag no longer exists.');
      }
      if (product.status !== 'available') {
        throw new CheckoutError(`"${product.name}" has already found its home. Please remove it from your bag.`, 409);
      }

      const quantity = requested.get(id)!;
      // Each piece is handmade; only an explicit is_unique === false allows several.
      const maxQty = product.is_unique === false ? MAX_QUANTITY_NON_UNIQUE : 1;
      if (quantity > maxQty) {
        throw new CheckoutError(`"${product.name}" is a one-of-a-kind piece — only one is available.`);
      }

      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0) {
        console.error(`Checkout: product ${id} has an invalid price`, product.price);
        throw new CheckoutError('One of the pieces cannot be purchased right now.', 500);
      }

      const firstImage = Array.isArray(product.images) ? product.images[0] : undefined;
      let imageUrl: string | undefined;
      if (firstImage) {
        try {
          imageUrl = new URL(firstImage, siteUrl).toString();
        } catch {
          imageUrl = undefined;
        }
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            ...(imageUrl ? { images: [imageUrl] } : {}),
          },
          unit_amount: Math.round(price * 100), // cents
        },
        quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      customer_email: email,
      metadata: {
        productIds: JSON.stringify(ids),
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Something went wrong starting checkout. Please try again.' }, { status: 500 });
  }
}
