'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';
import ProfileDetailModal from '@/components/ProfileDetailModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    async function fetchProfiles() {
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

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.id).includes(searchQuery)
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Navigation Sidebar */}
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      {/* Main Browse Grid Workspace */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Search & Filter Bar */}
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

        {/* 4-Column Grid View */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400 font-medium text-sm">
            Loading host profiles...
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            No profiles found. Add host profiles in `/admin`.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProfiles.map((lady) => (
              <div
                key={lady.id}
                className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 p-3 flex flex-col justify-between space-y-3"
              >
                {/* Photo Header */}
                <div 
                  onClick={() => setSelectedProfile(lady)}
                  className="relative h-72 rounded-2xl bg-slate-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={lady.resolvedImg || 'https://via.placeholder.com/400x500?text=No+Photo'}
                    alt={lady.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    I'm online now
                  </div>
                </div>

                {/* Info Header */}
                <div className="px-1">
                  <h3 className="font-extrabold text-slate-800 text-base">{lady.name}, {lady.age}</h3>
                  <p className="text-xs text-slate-400 font-medium">{lady.location || 'Mombasa, Kenya'}</p>
                </div>

                {/* 3 Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] py-2 rounded-xl shadow transition flex items-center justify-center gap-1">
                    💬 Chat
                  </button>
                  <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] py-2 rounded-xl transition flex items-center justify-center gap-1">
                    ✉️ Letter
                  </button>
                  <button
                    onClick={() => setSelectedProfile(lady)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] py-2 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    👤 Profile
                  </button>
                </div>

                {/* Like Button */}
                <button className="w-full border border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
                  💙 Like
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Profile Detail Pop-up */}
      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}
