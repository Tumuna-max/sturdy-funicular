'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initPage() {
      // Check auth status
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch profiles
      const { data } = await supabase.from('profiles').select('*').order('id', { ascending: true });
      if (data) setProfiles(data);
      setLoading(false);
    }
    initPage();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Frumence Date...</div>;
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      
      {/* GUEST BANNER OVERLAY (Shown when user is NOT logged in) */}
      {!user && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-6 border border-slate-100">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-3xl">
              🌹
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Welcome to Frumence Date</h1>
              <p className="text-xs text-slate-500 mt-2">
                Join thousands of online members. Create an account or log in to start chatting live today!
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login"
                className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-sm transition shadow-lg"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="w-full block border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-3 rounded-2xl text-xs transition"
              >
                Already have an account? Log In
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* DISCOVERY FEED */}
      <div className={`p-6 space-y-6 ${!user ? 'pointer-events-none select-none filter blur-sm' : ''}`}>
        {/* Top Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search ID or name"
              className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
              ONLINE
              <input type="checkbox" defaultChecked className="toggle-checkbox rounded" />
            </label>
            <button className="border border-slate-300 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              ⚙️ Search filter
            </button>
          </div>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
              <div className="relative aspect-[3/4] bg-slate-200">
                <img
                  src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80'}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                
                <span className="absolute top-3 left-3 bg-slate-900/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-md font-medium">
                  I'm online now
                </span>

                <span className="absolute top-3 right-3 bg-slate-900/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-md flex items-center gap-1 font-medium">
                  🖼️ All photos
                </span>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-4 pt-12">
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {profile.name}, {profile.age}
                  </h3>
                </div>
              </div>

              <div className="p-3 space-y-2 bg-white">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={user ? `/chat/${profile.id}` : '/login'}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    💬 Chat Now
                  </Link>
                  <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                    🤍 Like
                  </button>
                </div>

                <div className="flex items-center justify-around text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>✉️ Letter</span>
                  <span>👤 Profile</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
