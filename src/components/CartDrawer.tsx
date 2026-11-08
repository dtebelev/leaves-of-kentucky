"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  const money = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const shippingLeft = Math.max(0, 75 - subtotal);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside className={`fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-[var(--paper)] z-[100] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-7 h-[82px] border-b border-[var(--line)]">
          <h2 className="font-[family-name:var(--serif)] text-[29px] font-medium flex items-center gap-3">
            Your cart <span className="bg-[#e6e9df] rounded-full px-2 py-1 text-[10px]">{totalItems}</span>
          </h2>
          <button onClick={() => setIsOpen(false)} className="icon-btn" aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <ShoppingBag size={48} className="text-[#8e9b8d] stroke-[1px]" />
              <div>
                <h3 className="font-[family-name:var(--serif)] text-[29px] font-medium mb-2">Your cart is feeling light</h3>
                <p className="text-[var(--muted)] font-[family-name:var(--serif)] text-[17px]">Find a one-of-a-kind piece to make your own.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-[var(--green)] text-white px-8 py-3 text-[11px] font-bold tracking-[2px] hover:bg-[var(--green-deep)] transition-colors"
              >
                SHOP THE COLLECTION
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {items.map((item) => (
                <article key={item.id} className="py-6 flex gap-4">
                  <div className="relative w-[85px] h-[100px] flex-shrink-0">
                    <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-[family-name:var(--serif)] text-[19px] font-medium leading-tight">{item.name}</h3>
                      <span className="text-[11px] text-[var(--muted)]">{money(item.price)}</span>
                    </div>
                    <div className="flex items-center border border-[var(--line)] w-max h-7 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-[11px] w-[22px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <button onClick={() => removeFromCart(item.id)} className="text-[#8a9087] hover:text-red-500">
                      <X size={16} />
                    </button>
                    <div className="text-[11px] font-semibold">{money(item.price * item.quantity)}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-7 border-t border-[var(--line)] bg-[#f4f4eb]">
            <div className="mb-5">
              <p className="text-[10px] mb-2">
                {shippingLeft > 0
                  ? `You’re ${money(shippingLeft)} away from free U.S. shipping`
                  : 'You’ve unlocked free U.S. shipping!'}
              </p>
              <div className="h-[3px] bg-[#d8ded3] w-full">
                <div
                  className="h-full bg-[var(--copper)] transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / 75) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-1">
              <span className="font-[family-name:var(--serif)] text-[20px]">Subtotal</span>
              <strong className="text-[17px]">{money(subtotal)}</strong>
            </div>
            <p className="text-center text-[9px] text-[var(--muted)] mb-4">Shipping calculated at checkout</p>
            <Link
              href="/checkout"
              className="w-full h-12 flex items-center justify-center bg-[var(--green)] text-white text-[11px] font-bold tracking-[2px] hover:bg-[var(--green-deep)] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              CHECK OUT
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
