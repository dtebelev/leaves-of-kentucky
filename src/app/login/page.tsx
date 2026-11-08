"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Header />

      <main className="section-shell py-20 flex flex-col items-center justify-center">
        <div className="w-full max-w-[420px] bg-white p-10 shadow-sm border border-[var(--line)]">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <span className="eyebrow text-[9px] font-semibold tracking-[2.4px] text-[var(--green-soft)]">WELCOME BACK</span>
                <h1 className="font-[family-name:var(--serif)] text-[36px] font-medium mt-2">Sign In</h1>
                <p className="text-[var(--muted)] text-[14px] mt-2">We'll send a magic link to your email for a secure, password-less login.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-[1px] uppercase text-[var(--muted)]">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-12 border border-[var(--line)] bg-white pl-12 pr-4 text-[14px] outline-none focus:border-[var(--green)]"
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-[12px]">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[var(--green)] text-white text-[11px] font-bold tracking-[2px] hover:bg-[var(--green-deep)] transition-all flex items-center justify-center gap-3"
                >
                  {loading ? 'SENDING...' : 'SEND MAGIC LINK'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 py-4">
              <CheckCircle2 size={64} className="mx-auto text-[var(--green)] stroke-[1.5px]" />
              <div>
                <h2 className="font-[family-name:var(--serif)] text-[32px] font-medium">Check your email</h2>
                <p className="text-[var(--muted)] text-[15px] mt-3 leading-relaxed">
                  We've sent a sign-in link to <strong>{email}</strong>. <br/>
                  Click the link in the email to be logged in automatically.
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="text-[var(--green)] text-[11px] font-bold tracking-[1px] border-b border-[var(--green)] pb-1"
              >
                TRY DIFFERENT EMAIL
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
