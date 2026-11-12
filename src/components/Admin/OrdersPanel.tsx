"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, AlertTriangle, Package } from 'lucide-react';
import './admin.css';

type OrderItem = { name: string; quantity: number; amount: number };
type Order = {
  id: string;
  created_at: string;
  stripe_session_id: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_name: string | null;
  shipping_address: {
    line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string;
  } | null;
  items: OrderItem[];
  subtotal_cents: number | null;
  shipping_cents: number | null;
  total_cents: number | null;
  status: 'paid' | 'shipped';
  tracking_number: string | null;
  shipped_at: string | null;
  needs_review: boolean;
  review_note: string | null;
};

const money = (cents: number | null | undefined) =>
  cents == null ? '—' : `$${(cents / 100).toFixed(2)}`;

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('shop_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError(
        error.message.includes('shop_orders')
          ? 'The orders table has not been created yet (run supabase/orders.sql in Supabase).'
          : error.message
      );
    } else {
      setError('');
      setOrders((data as Order[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markShipped = async (order: Order) => {
    setSavingId(order.id);
    setError('');
    const { data, error } = await supabase
      .from('shop_orders')
      .update({
        status: 'shipped',
        tracking_number: (tracking[order.id] ?? '').trim() || null,
        shipped_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select('id');
    setSavingId(null);
    if (error || !data || data.length === 0) {
      setError(error?.message || 'Nothing was saved. Please sign in again and retry.');
      return;
    }
    await load();
  };

  if (loading) return <p className="adm-muted">Loading orders...</p>;

  return (
    <div>
      {error && <div className="adm-error">{error}</div>}

      {orders.length === 0 && !error && (
        <div className="adm-card">
          <div className="adm-empty">
            <Package size={48} strokeWidth={1} />
            <p>No orders yet.</p>
          </div>
        </div>
      )}

      <div className="adm-orders">
        {orders.map((o) => {
          const a = o.shipping_address;
          return (
            <article key={o.id} className="adm-order">
              <header className="adm-order-head">
                <div>
                  <div className="adm-order-date">
                    {new Date(o.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div className="adm-order-total">{money(o.total_cents)}</div>
                </div>
                <span className={`adm-badge ${o.status === 'shipped' ? 'adm-badge-available' : 'adm-badge-sold'}`}>
                  {o.status === 'shipped' ? 'SHIPPED' : 'TO SHIP'}
                </span>
              </header>

              {o.needs_review && (
                <div className="adm-order-warn">
                  <AlertTriangle size={14} /> {o.review_note || 'Please review this order.'}
                </div>
              )}

              <div className="adm-order-cols">
                <div>
                  <div className="adm-label">Items</div>
                  {o.items.map((it, i) => (
                    <div key={i} className="adm-order-line">
                      <span>{it.name}{it.quantity > 1 ? ` × ${it.quantity}` : ''}</span>
                      <span>{money(it.amount)}</span>
                    </div>
                  ))}
                  <div className="adm-order-line adm-order-sub">
                    <span>Shipping</span>
                    <span>{money(o.shipping_cents)}</span>
                  </div>
                </div>

                <div>
                  <div className="adm-label">Ship to</div>
                  <div className="adm-order-addr">
                    <strong>{o.shipping_name || o.customer_name || '—'}</strong>
                    {a ? (
                      <>
                        <div>{a.line1}</div>
                        {a.line2 && <div>{a.line2}</div>}
                        <div>{[a.city, a.state, a.postal_code].filter(Boolean).join(', ')}</div>
                        <div>{a.country}</div>
                      </>
                    ) : (
                      <div className="adm-muted">No address</div>
                    )}
                    <div className="adm-muted">{o.customer_email}{o.customer_phone ? ` · ${o.customer_phone}` : ''}</div>
                  </div>
                </div>
              </div>

              <footer className="adm-order-foot">
                {o.status === 'shipped' ? (
                  <span className="adm-muted">
                    <Truck size={14} style={{ verticalAlign: '-2px' }} /> Shipped
                    {o.shipped_at ? ` on ${new Date(o.shipped_at).toLocaleDateString('en-US')}` : ''}
                    {o.tracking_number ? ` · Tracking: ${o.tracking_number}` : ''}
                  </span>
                ) : (
                  <>
                    <input
                      className="adm-input adm-order-track"
                      placeholder="Tracking number (optional)"
                      value={tracking[o.id] ?? ''}
                      onChange={(e) => setTracking({ ...tracking, [o.id]: e.target.value })}
                    />
                    <button
                      className="adm-btn"
                      disabled={savingId === o.id}
                      onClick={() => markShipped(o)}
                    >
                      <Truck size={16} /> {savingId === o.id ? 'SAVING...' : 'MARK AS SHIPPED'}
                    </button>
                  </>
                )}
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
