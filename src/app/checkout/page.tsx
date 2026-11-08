'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowRight, Lock, ShieldCheck, Truck } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const money = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, email }),
      });

      const session = await response.json();
      const stripe = await stripePromise;

      if (session.id && stripe) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--paper)]">
        <Header />
        <main className="section-shell py-32 text-center">
          <h1 className="font-[family-name:var(--serif)] text-4xl mb-6">Your bag is empty</h1>
          <a href="/shop" className="button button-dark">RETURN TO SHOP</a>
        </main>
      </div>
    );
  }

  const shipping = subtotal >= 75 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Header />

      <main className="section-shell py-12 md:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Form Side */}
          <div>
            <h1 className="font-[family-name:var(--serif)] text-[44px] leading-tight mb-8">Checkout</h1>

            <form onSubmit={handleCheckout} className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-[10px] tracking-[2px] font-bold text-[var(--green)]">1. CONTACT INFORMATION</h2>
                <div className="form-field">
                  <label>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-[10px] tracking-[2px] font-bold text-[var(--green)]">2. SHIPPING & PAYMENT</h2>
                <div className="bg-[#f0f1e8] p-6 text-[13px] font-[family-name:var(--serif)] text-[var(--muted)] leading-relaxed">
                  To ensure the highest security for your artisan purchase, shipping and payment details are handled on our encrypted Stripe payment page.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="button button-dark full-width h-[56px] text-[11px] tracking-[2px]"
              >
                {loading ? 'PREPARING...' : `CONTINUE TO SECURE PAYMENT`} <ArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center gap-6 pt-4 border-t border-[var(--line)]">
                <div className="flex items-center gap-2 text-[9px] text-[var(--muted)]">
                  <Lock size={12} /> SECURE CHECKOUT
                </div>
                <div className="flex items-center gap-2 text-[9px] text-[var(--muted)]">
                  <ShieldCheck size={12} /> ENCRYPTED DATA
                </div>
              </div>
            </form>
          </div>

          {/* Summary Side */}
          <div className="bg-[#f7f6ef] border border-[var(--line)] p-8 h-fit lg:sticky lg:top-[120px]">
            <h2 className="text-[10px] tracking-[2px] font-bold text-[var(--green)] mb-6">ORDER SUMMARY</h2>

            <div className="space-y-6 mb-8">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-[#e9e8de] flex-shrink-0 overflow-hidden">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-[family-name:var(--serif)] text-[17px] font-medium leading-tight">{item.name}</h3>
                    <div className="text-[11px] text-[var(--muted)] mt-1">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-[13px] font-medium">{money(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-[var(--line)]">
              <div className="flex justify-between text-[14px]">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : money(shipping)}</span>
              </div>
              <div className="flex justify-between text-[20px] font-[family-name:var(--serif)] font-medium pt-3 border-t border-[var(--line)]">
                <span>Total</span>
                <span className="text-[var(--copper)]">{money(total)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4">
                <Truck size={20} className="text-[var(--green)] flex-shrink-0" />
                <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                  <strong>Standard Shipping (1-2 Days)</strong><br/>
                  Our studio works quickly to ship your one-of-a-kind piece with the same care we put into making it.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
