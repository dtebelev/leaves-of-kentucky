'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Menu, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items, totalItems, subtotal, removeFromCart, updateQuantity, isOpen, setIsOpen } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const money = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <>
      <div className="announcement">
        <span>FREE U.S. SHIPPING ON ORDERS OVER $75</span>
        <span className="separator">|</span>
        <span>EVERY PIECE IS ONE-OF-A-KIND</span>
      </div>

      <header className="site-header" suppressHydrationWarning>
        <Link href="/" className="brand" suppressHydrationWarning>
          <svg className="brand-leaf" viewBox="0 0 48 66" fill="none" stroke="currentColor" strokeWidth="1.35">
            <path d="M39 3C23 9 9 22 8 39c-1 12 5 20 14 20 16 0 21-23 17-56Z" />
            <path d="M5 64 33 13M15 48l-2-15M21 37l14-5M26 26l-1-10M12 54l15-4" />
          </svg>
          <span>
            <strong>LEAVES OF KENTUCKY</strong>
            <small>ARTISAN JEWELRY</small>
          </span>
        </Link>

        <nav className="desktop-nav">
          {['Shop', 'Our story', 'Our process', 'Gifts', 'Contact'].map((item) => (
            <Link
              key={item}
              href={item === 'Shop' ? '/shop' : item === 'Our story' ? '/our-story' : `/#${item.toLowerCase().replace(' ', '')}`}
              className="nav-link"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="icon-btn search-btn" aria-label="Search"><Search size={20} /></button>

          <button onClick={() => setIsOpen(true)} className="icon-btn bag-btn" aria-label="Cart">
            <ShoppingBag size={20} />
            {mounted && totalItems > 0 && (
              <span className="cart-count">
                {totalItems}
              </span>
            )}
          </button>

          <button
            className="menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div
        className={`overlay ${isOpen ? 'show' : ''}`}
        style={{ display: isOpen ? 'block' : 'none', opacity: isOpen ? 1 : 0 }}
        onClick={() => setIsOpen(false)}
      ></div>

      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h2>Your Bag {mounted && <span>{totalItems}</span>}</h2>
          <button className="icon-btn" onClick={() => setIsOpen(false)}><X size={24} /></button>
        </div>

        <div className="cart-content">
          {!mounted ? (
            <div className="py-20 text-center font-[family-name:var(--serif)] text-lg text-[var(--muted)]">
              Opening your bag...
            </div>
          ) : items.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} strokeWidth={1} />
              <h3>Your bag is empty</h3>
              <p>Looks like you haven't added anything yet.</p>
              <button onClick={() => setIsOpen(false)} className="button button-dark">CONTINUE SHOPPING</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.images[0]} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <div className="cart-item-price">{money(item.price)}</div>
                  <div className="quantity">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={12} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={12} /></button>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <button className="remove-item" onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                  <div className="cart-item-total">{money(item.price * item.quantity)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {mounted && items.length > 0 && (
          <div className="cart-footer">
            <div className="shipping-progress">
              <p>{subtotal >= 75 ? "You've unlocked free shipping!" : `Add ${money(75 - subtotal)} more for free shipping`}</p>
              <div><span style={{ width: `${Math.min(100, (subtotal / 75) * 100)}%` }}></span></div>
            </div>
            <div className="cart-total">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div className="cart-note">Taxes and shipping calculated at checkout</div>
            <Link href="/checkout" className="button button-dark full-width" onClick={() => setIsOpen(false)}>
              CHECKOUT <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <nav className="mobile-nav">
            {['Shop', 'Our story', 'Our process', 'Gifts', 'Contact'].map((item) => (
              <Link
                key={item}
                href={item === 'Shop' ? '/shop' : item === 'Our story' ? '/our-story' : `/#${item.toLowerCase().replace(' ', '')}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
