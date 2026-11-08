"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import './login.css';

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
    <div className="lg-page">
      <Header />

      <main className="lg-main">
        <div className="lg-card">
          {!sent ? (
            <>
              <div className="lg-head">
                <span className="lg-eyebrow">WELCOME BACK</span>
                <h1 className="lg-title">Sign In</h1>
                <p className="lg-text">We'll send a magic link to your email for a secure, password-less login.</p>
              </div>

              <form onSubmit={handleLogin}>
                <label className="lg-label" htmlFor="login-email">Email Address</label>
                <div className="lg-field">
                  <Mail size={18} />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="lg-input"
                  />
                </div>

                {error && <p className="lg-error">{error}</p>}

                <button type="submit" disabled={loading} className="lg-btn">
                  {loading ? 'SENDING...' : 'SEND MAGIC LINK'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="lg-sent">
              <CheckCircle2 size={64} strokeWidth={1.5} />
              <h2 className="lg-title">Check your email</h2>
              <p className="lg-text">
                We've sent a sign-in link to <strong>{email}</strong>.<br />
                Click the link in the email to be logged in automatically.
              </p>
              <button type="button" onClick={() => setSent(false)} className="lg-link">
                TRY DIFFERENT EMAIL
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
