'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function OnlineNowPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOnlineProfiles() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProfiles(
          data.map((p) => ({
            ...p,
            resolvedImg: p.image_url || p.avatar_url || p.image || p.photo_url || ''
          }))
        );
      }
      setLoading(false);
    }
    fetchOnlineProfiles();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition cursor-pointer w-fit"
        >
          <span>←</span> Back
        </button>

        <h1 className="text-2xl font-black text-slate-800">Online Now ({profiles.length} Active Profiles)</h1>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading active host members...</div>
        ) : profiles.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <span className="text-5xl">🌐</span>
            <h2 className="font-extrabold text-slate-800 text-lg">No Profiles Available</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Profiles added to Supabase will automatically appear here live.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {profiles.map((lady) => (
              <div
                key={lady.id}
                className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div
                  onClick={() => router.push(`/chat/${lady.id}`)}
                  className="relative h-64 rounded-2xl overflow-hidden bg-slate-100 cursor-pointer"
                >
                  <img src={lady.resolvedImg || 'https://via.placeholder.com/300'} alt={lady.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/25 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online now
                  </div>
                </div>

                <div className="px-1">
                  <h3 className="font-extrabold text-slate-800 text-base">{lady.name}, {lady.age}</h3>
                  <p className="text-xs text-slate-400">{lady.location || 'Mombasa, Kenya'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => router.push(`/chat/${lady.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                  >
                    💬 Chat
                  </button>
                  <button
                    onClick={() => router.push(`/letters?to=${lady.id}`)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                  >
                    ✉️ Letter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
