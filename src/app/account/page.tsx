"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Package, MapPin, User, LogOut } from 'lucide-react';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Fetch orders
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(orderData || []);
      setLoading(false);
    }

    getProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--paper)]">
        <Header />
        <main className="section-shell py-20 text-center">
          <p className="font-[family-name:var(--serif)] text-[24px]">Loading your profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Header />

      <main className="section-shell py-12 md:py-20">
        <div className="flex justify-between items-end border-b border-[var(--line)] pb-8 mb-12">
          <div>
            <span className="eyebrow text-[9px] font-semibold tracking-[2.4px] text-[var(--green-soft)]">MY ACCOUNT</span>
            <h1 className="font-[family-name:var(--serif)] text-[48px] font-medium mt-2">Welcome, {profile?.full_name || user?.email.split('@')[0]}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--green)] text-[11px] font-bold tracking-[1px] transition-colors"
          >
            <LogOut size={16} /> LOG OUT
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Sidebar Info */}
          <div className="space-y-10">
            <section>
              <h2 className="text-[12px] font-bold tracking-[2px] mb-6 flex items-center gap-2">
                <User size={18} className="text-[var(--copper)]" /> ACCOUNT DETAILS
              </h2>
              <div className="space-y-2 text-[15px] font-[family-name:var(--serif)] text-[var(--muted)]">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Name:</strong> {profile?.full_name || 'Not provided'}</p>
                <p><strong>Phone:</strong> {profile?.phone || 'Not provided'}</p>
              </div>
            </section>

            <section>
              <h2 className="text-[12px] font-bold tracking-[2px] mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-[var(--copper)]" /> SHIPPING ADDRESS
              </h2>
              <p className="text-[15px] font-[family-name:var(--serif)] text-[var(--muted)] leading-relaxed">
                {profile?.address || 'No address saved yet. We will save it during your next checkout.'}
              </p>
            </section>
          </div>

          {/* Orders History */}
          <div className="lg:col-span-2">
            <h2 className="text-[12px] font-bold tracking-[2px] mb-6 flex items-center gap-2">
              <Package size={18} className="text-[var(--copper)]" /> ORDER HISTORY
            </h2>

            {orders.length === 0 ? (
              <div className="bg-white p-12 border border-dashed border-[var(--line)] text-center">
                <p className="font-[family-name:var(--serif)] text-[19px] text-[var(--muted)]">You haven't placed any orders yet.</p>
                <a href="/shop" className="inline-block mt-4 text-[var(--green)] text-[11px] font-bold tracking-[1.5px] border-b border-[var(--green)]">
                  START SHOPPING
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-6 border border-[var(--line)] shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] text-[var(--muted)] tracking-[1px]">ORDER #{order.id.slice(0,8).toUpperCase()}</span>
                        <p className="text-[13px] font-medium mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] px-2 py-1 rounded-full ${
                          order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                        <p className="text-[16px] font-bold mt-2">${order.total_amount}</p>
                      </div>
                    </div>
                    {/* Order items can be added here */}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
