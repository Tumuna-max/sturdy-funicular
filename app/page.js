'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Fetch profiles from Supabase
  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
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

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.id).includes(searchQuery)
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left Navigation Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col justify-between shrink-0 h-full">
        <div className="space-y-6">
          <div className="flex items-center gap-2 font-extrabold text-blue-600 text-lg">
            <span>🌹</span> Frumence Date
          </div>

          <nav className="space-y-2 text-sm font-semibold text-slate-600">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold shadow-sm">
              💬 All chats
            </Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition">
              ⚡ Active Chats
            </Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition">
              💳 Purchase History
            </Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition">
              👤 My Profile & Details
            </Link>
          </nav>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          🛡️ Policy
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Filter Bar */}
        <div className="flex items-center justify-between gap-4 bg-white p-3 px-4 rounded-2xl border border-slate-200 shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID or name"
            className="w-full text-sm outline-none bg-transparent text-slate-700"
          />
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 shrink-0">
            <label className="flex items-center gap-2 cursor-pointer">
              <span>ONLINE</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 accent-blue-600" />
            </label>
            <button className="flex items-center gap-1 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition">
              ⚙️ Search filter
            </button>
          </div>
        </div>

        {/* Profile Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400 font-medium text-sm">
            Loading host profiles...
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            No profiles found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProfiles.map((lady) => (
              <div
                key={lady.id}
                onClick={() => setSelectedProfile(lady)}
                className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Image & Online Status Only (Corner 'All Photos' Badge Removed) */}
                <div className="relative h-80 bg-slate-100 overflow-hidden">
                  <img
                    src={lady.resolvedImg || 'https://via.placeholder.com/400x500?text=No+Photo'}
                    alt={lady.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Clean Online Tag */}
                  <div className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    I'm online now
                  </div>
                </div>

                {/* Card Bottom Details */}
                <div className="p-4 bg-white flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{lady.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Age {lady.age}</p>
                  </div>
                  <button className="bg-blue-50 text-blue-600 font-bold text-xs px-3 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Client Profile Details Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="relative h-80 bg-slate-200">
              <img
                src={selectedProfile.resolvedImg || 'https://via.placeholder.com/400x500?text=No+Photo'}
                alt={selectedProfile.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProfile(null)}
                className="absolute top-3 right-3 bg-slate-900/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold hover:bg-slate-900 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{selectedProfile.name}, {selectedProfile.age}</h2>
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online & Available to Chat
                  </p>
                </div>
                <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">
                  ID: {selectedProfile.id}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <p><strong className="text-slate-800">Bio:</strong> {selectedProfile.bio || "Hey there! Send me a message to start chatting."}</p>
              </div>

              <Link
                href={`/chat/${selectedProfile.id}`}
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition"
              >
                💬 Start Chat (2 Cr)
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
