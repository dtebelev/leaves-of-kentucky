"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, ExternalLink, Package } from 'lucide-react';
import Image from 'next/image';
import { AddProductForm } from '@/components/Admin/AddProductForm';

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
  };

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[var(--line)] border-t-[var(--green)] rounded-full animate-spin" />
        <p className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--muted)]">Loading Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="section-shell py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-[family-name:var(--serif)] text-[40px] font-medium">Inventory Manager</h1>
            <p className="text-[var(--muted)] text-[14px]">Manage your handcrafted copper pieces.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[var(--green)] text-white px-6 py-3 text-[11px] font-bold tracking-[1.5px] flex items-center gap-2 hover:bg-[var(--green-deep)] transition-colors"
          >
            <Plus size={16} /> ADD NEW PIECE
          </button>
        </div>

        {showAddForm && (
          <AddProductForm
            onClose={() => setShowAddForm(false)}
            onSuccess={fetchProducts}
          />
        )}

        <div className="bg-white border border-[var(--line)] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--line)]">
                <th className="px-6 py-4 text-[10px] font-bold tracking-[1.5px] text-[var(--muted)]">PRODUCT</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[1.5px] text-[var(--muted)]">CATEGORY</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[1.5px] text-[var(--muted)]">PRICE</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[1.5px] text-[var(--muted)]">STATUS</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[1.5px] text-[var(--muted)] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 bg-gray-100 flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt="" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                             <Package size={16} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[14px] font-medium">{product.name}</div>
                        <div className="text-[11px] text-[var(--muted)] truncate max-w-[200px]">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[var(--muted)]">{product.category}</td>
                  <td className="px-6 py-4 text-[14px] font-medium">${product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      product.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-[var(--green)] transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <a
                        href={`/product/${product.id}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
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
            <div className="p-20 text-center flex flex-col items-center gap-4 text-[var(--muted)]">
              <Package size={48} className="stroke-[1px]" />
              <p className="font-[family-name:var(--serif)] text-[20px]">Your inventory is empty.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
