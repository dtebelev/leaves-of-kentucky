import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Tells the admin page whether the signed-in user is the store owner.
// The owner's email lives only on the server (ADMIN_EMAIL) and is never sent to the browser.
// NOTE: this only controls what the admin screen shows. The real protection of the data
// is the database policies in supabase/admin-security.sql.
export async function GET(req: Request) {
  // ADMIN_EMAIL may hold several addresses separated by commas: "a@x.com,b@y.com"
  const adminEmails = (process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (adminEmails.length === 0 || !url || !anonKey) {
    console.error('Admin check: ADMIN_EMAIL or Supabase env is not configured');
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  // Validate the token with Supabase (not just decode it).
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const isAdmin = adminEmails.includes(data.user.email.toLowerCase());
  return NextResponse.json({ isAdmin }, { status: isAdmin ? 200 : 403 });
}
