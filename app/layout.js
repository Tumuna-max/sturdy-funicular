'use client';

import './globals.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('users').select('credits').eq('id', user.id).single();
        if (data) setCredits(data.credits);
      }
    }
    loadUser();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-800 antialiased min-h-screen">
        <div className="flex max-w-[1600px] mx-auto min-h-screen bg-white shadow-xl">
          
          {/* LEFT SIDEBAR */}
          <aside className="w-64 border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 bg-white">
            <div className="space-y-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 text-blue-600 font-extrabold text-xl px-2">
                <span className="text-2xl">🌹</span> Frumence Date
              </Link>

              {/* Profile Card / Auth Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-sm">
                  {user ? user.email.substring(0, 2).toUpperCase() : 'GS'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 truncate">{user ? user.email : 'Guest'}</p>
                  <div className="flex gap-1 text-xs mt-1">
                    <Link href="/dashboard" className="border border-slate-300 rounded px-2 py-0.5 font-medium hover:bg-slate-200">
                      Profile
                    </Link>
                    {user ? (
                      <button onClick={handleLogout} className="border border-rose-300 text-rose-600 rounded px-2 py-0.5 font-medium hover:bg-rose-50">
                        Logout
                      </button>
                    ) : (
                      <Link href="/login" className="border border-blue-300 text-blue-600 rounded px-2 py-0.5 font-medium hover:bg-blue-50">
                        Login
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Credits Button */}
              <Link
                href="/topup"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>🪙</span> Add credits ({credits})
              </Link>

              {/* Nav Links */}
              <nav className="space-y-1 text-sm font-medium text-slate-600">
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-900 font-semibold">
                  <span>💬</span> All chats
                </Link>
                <Link href="/topup" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100">
                  <span>💳</span> Purchase History
                </Link>
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100">
                  <span>👤</span> My Profile & Details
                </Link>
                <Link href="/operator" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-emerald-600 font-bold">
                  <span>🎧</span> Worker Console
                </Link>
                <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-purple-600 font-bold">
                  <span>⚙️</span> Admin Panel
                </Link>
              </nav>
            </div>

            {/* Bottom Policy Button */}
            <div className="pt-4 border-t border-slate-200">
              <button className="w-full border border-slate-300 rounded-xl py-2 text-sm text-slate-600 hover:bg-slate-50">
                🛡️ Policy
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 border-r border-slate-200 bg-slate-50 min-w-0">
            {children}
          </main>

          {/* RIGHT ACTIVITY PANEL */}
          <aside className="w-64 p-4 hidden xl:block shrink-0 bg-white space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Notifications</h3>
              <p className="text-xs text-slate-400 italic">No new notifications</p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Members Activity</h3>
              <p className="text-xs text-slate-400 italic">Recent activity will appear here</p>
            </div>
          </aside>

        </div>
      </body>
    </html>
  );
}
