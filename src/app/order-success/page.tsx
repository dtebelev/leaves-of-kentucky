'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Header />

      <main className="section-shell py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-[var(--green)] flex items-center justify-center text-[var(--green)]">
              <CheckCircle size={40} strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="font-[family-name:var(--serif)] text-[52px] md:text-[64px] leading-tight tracking-tight">
            Thank you for your order
          </h1>

          <p className="font-[family-name:var(--serif)] text-[22px] text-[var(--muted)] leading-relaxed">
            Your support of artisan craft means the world to us. We’re preparing your one-of-a-kind piece and will send a tracking number to your email shortly.
          </p>

          <div className="pt-10 flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/shop" className="button button-dark h-[56px] px-10 text-[11px] tracking-[2px]">
              CONTINUE SHOPPING
            </Link>
            <Link href="/" className="button button-outline h-[56px] px-10 text-[11px] tracking-[2px]">
              RETURN HOME
            </Link>
          </div>

          <div className="pt-16 border-t border-[var(--line)] grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-3">
              <h3 className="text-[10px] tracking-[2px] font-bold text-[var(--green)]">NEXT STEPS</h3>
              <p className="text-[12px] text-[var(--muted)] leading-relaxed">
                Check your inbox for an order confirmation. Every piece is packed in our signature gift box, ready to be enjoyed.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-[10px] tracking-[2px] font-bold text-[var(--green)]">HAVE QUESTIONS?</h3>
              <p className="text-[12px] text-[var(--muted)] leading-relaxed">
                We’re here to help. Reach out to our Kentucky studio at <a href="mailto:hello@leavesofkentucky.com" className="underline">hello@leavesofkentucky.com</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
