"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, ExternalLink, Package } from 'lucide-react';
import { AddProductForm } from '@/components/Admin/AddProductForm';
import { OrdersPanel } from '@/components/Admin/OrdersPanel';
import '@/components/Admin/admin.css';

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [tab, setTab] = useState<'inventory' | 'orders'>('inventory');
  const router = useRouter();

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .order('name', { ascending: true });
    setProducts(data || []);
  };

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Ask the server whether this user is the store owner.
      let allowed = false;
      try {
        const res = await fetch('/api/admin/check', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        allowed = res.ok && (await res.json()).isAdmin === true;
      } catch {
        allowed = false;
      }

      if (!allowed) {
        router.push('/');
        return;
      }

      setIsAdmin(true);
      await fetchProducts();
      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  if (loading) return (
    <div className="adm-loading">
      <div className="adm-loading-inner">
        <div className="adm-spinner" />
        <p className="adm-loading-text">Loading Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="adm-page">
      <Header />

      <main className="adm-main">
        <div className="adm-top">
          <div>
            <h1 className="adm-title">{tab === 'orders' ? 'Orders' : 'Inventory Manager'}</h1>
            <p className="adm-subtitle">
              {tab === 'orders' ? 'See what to pack and where to send it.' : 'Manage your handcrafted copper pieces.'}
            </p>
          </div>
          {tab === 'inventory' && (
            <button onClick={() => setShowAddForm(true)} className="adm-btn">
              <Plus size={16} /> ADD NEW PIECE
            </button>
          )}
        </div>

        <div className="adm-tabs">
          <button
            type="button"
            className={`adm-tab ${tab === 'inventory' ? 'is-active' : ''}`}
            onClick={() => setTab('inventory')}
          >
            Inventory
          </button>
          <button
            type="button"
            className={`adm-tab ${tab === 'orders' ? 'is-active' : ''}`}
            onClick={() => setTab('orders')}
          >
            Orders
          </button>
        </div>

        {showAddForm && (
          <AddProductForm
            onClose={() => setShowAddForm(false)}
            onSuccess={fetchProducts}
          />
        )}

        {editing && (
          <AddProductForm
            key={editing.id}
            product={editing}
            onClose={() => setEditing(null)}
            onSuccess={fetchProducts}
          />
        )}

        {tab === 'orders' && <OrdersPanel />}

        {tab === 'inventory' && (
        <div className="adm-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th className="adm-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="adm-product">
                      <div className="adm-thumb">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" />
                        ) : (
                          <Package size={16} />
                        )}
                      </div>
                      <div>
                        <div className="adm-name">{product.name}</div>
                        <div className="adm-desc">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="adm-muted">{product.category}</td>
                  <td className="adm-price">${product.price}</td>
                  <td>
                    <span className={`adm-badge ${product.status === 'available' ? 'adm-badge-available' : 'adm-badge-sold'}`}>
                      {String(product.status ?? '').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-icon-btn" title="Edit" onClick={() => setEditing(product)}>
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="adm-icon-btn adm-danger"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <a
                        href={`/product/${product.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="adm-icon-btn"
                        title="View on site"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="adm-empty">
              <Package size={48} strokeWidth={1} />
              <p>Your inventory is empty.</p>
            </div>
          )}
        </div>
        )}
      </main>
    </div>
  );
}
