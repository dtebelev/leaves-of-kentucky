'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { ArrowRight, Lock, ShieldCheck, Truck } from 'lucide-react';
import './checkout.css';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const money = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, email }),
      });

      const session = await response.json().catch(() => ({}));

      if (response.ok && session.url) {
        window.location.href = session.url;
        return;
      }
      setError(session.error || 'Something went wrong starting checkout. Please try again.');
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Could not reach the payment service. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="co-page">
        <Header />
        <main className="co-empty">
          <h1>Your bag is empty</h1>
          <a href="/shop" className="co-btn co-btn-auto">RETURN TO SHOP</a>
        </main>
      </div>
    );
  }

  const shipping = subtotal >= 75 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <div className="co-page">
      <Header />

      <main className="co-main">
        <div className="co-grid">

          {/* Form Side */}
          <div>
            <h1 className="co-title">Checkout</h1>

            <form onSubmit={handleCheckout} className="co-form-card">
              <div className="co-step">
                <h2 className="co-step-title">1. CONTACT INFORMATION</h2>
                <label className="co-label" htmlFor="checkout-email">Email Address</label>
                <input
                  id="checkout-email"
                  className="co-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="co-step">
                <h2 className="co-step-title">2. SHIPPING &amp; PAYMENT</h2>
                <p className="co-note">
                  To ensure the highest security for your artisan purchase, shipping and payment details are handled on our encrypted Stripe payment page.
                </p>
              </div>

              {error && <p className="co-error">{error}</p>}

              <button type="submit" disabled={loading} className="co-btn">
                {loading ? 'PREPARING...' : 'CONTINUE TO SECURE PAYMENT'} <ArrowRight size={18} />
              </button>

              <div className="co-trust">
                <span><Lock size={12} /> SECURE CHECKOUT</span>
                <span><ShieldCheck size={12} /> ENCRYPTED DATA</span>
              </div>
            </form>
          </div>

          {/* Summary Side */}
          <aside className="co-summary">
            <h2 className="co-summary-title">ORDER SUMMARY</h2>

            <div className="co-items">
              {items.map((item) => (
                <div key={item.id} className="co-item">
                  <div className="co-thumb">
                    <img src={item.images?.[0]} alt={item.name} />
                  </div>
                  <div className="co-item-info">
                    <h3 className="co-item-name">{item.name}</h3>
                    <div className="co-item-qty">Qty: {item.quantity}</div>
                  </div>
                  <div className="co-item-price">{money(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="co-totals">
              <div className="co-row">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="co-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : money(shipping)}</span>
              </div>
              <div className="co-total">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>

            <div className="co-ship">
              <Truck size={20} />
              <p>
                <strong>Standard Shipping (1-2 Days)</strong><br />
                Our studio works quickly to ship your one-of-a-kind piece with the same care we put into making it.
              </p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
