'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import './order-success.css';

export default function OrderSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="os-page">
      <Header />

      <main className="os-main">
        <div className="os-card">
          <div className="os-badge">
            <CheckCircle size={40} strokeWidth={1.5} />
          </div>

          <span className="os-eyebrow">ORDER CONFIRMED</span>
          <h1 className="os-title">Thank you for your order</h1>

          <p className="os-lead">
            Your support of artisan craft means the world to us. We’re preparing your one-of-a-kind piece and will send a tracking number to your email shortly.
          </p>

          <div className="os-actions">
            <Link href="/shop" className="os-btn os-btn-dark">CONTINUE SHOPPING</Link>
            <Link href="/" className="os-btn os-btn-outline">RETURN HOME</Link>
          </div>

          <div className="os-info">
            <div>
              <h3>NEXT STEPS</h3>
              <p>Check your inbox for an order confirmation. Every piece is packed in our signature gift box, ready to be enjoyed.</p>
            </div>
            <div>
              <h3>HAVE QUESTIONS?</h3>
              <p>We’re here to help. Reach out to our Kentucky studio at <a href="mailto:hello@leavesofkentucky.com">hello@leavesofkentucky.com</a>.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
