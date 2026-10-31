'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';
import AuthModal from '@/components/AuthModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function BrowseLadiesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const uuid = localStorage.getItem('frumence_client_uuid');
    if (uuid) {
      setIsLoggedIn(true);
      const savedCredits = localStorage.getItem('user_credits');
      const savedName = localStorage.getItem('user_name');
      if (savedCredits) setCredits(Number(savedCredits));
      if (savedName) setUserName(savedName);
    }

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
        const formatted = data.map((p) => ({
          ...p,
          resolvedImg: p.image_url || p.avatar_url || p.image || p.photo_url || ''
        }));
        setProfiles(formatted);
      }
      setLoading(false);
    }

    fetchProfiles();
  }, []);

  const handleProtectedAction = (targetPath) => {
    const uuid = localStorage.getItem('frumence_client_uuid');
    if (!uuid) {
      setShowAuthModal(true);
    } else {
      router.push(targetPath);
    }
  };

  const filteredProfiles = profiles.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <ClientSidebar credits={credits} userName={userName} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Search Header */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <span className="text-slate-400 pl-2">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID or name..."
            className="w-full text-xs outline-none bg-transparent text-slate-700 font-medium"
          />
        </div>

        {/* Profiles Grid */}
        {loading ? (
          <div className="text-center text-slate-400 text-xs py-20">Loading ladies...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-20">No profiles found in database.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map((lady) => (
              <div key={lady.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition p-3 space-y-3">
                <div className="relative h-72 rounded-2xl overflow-hidden bg-slate-100">
                  <img src={lady.resolvedImg} alt={lady.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-md text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online now
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">{lady.name}, {lady.age}</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{lady.location || 'Mombasa'}</p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => handleProtectedAction(`/chat/${lady.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    💬 Chat
                  </button>
                  <button
                    onClick={() => handleProtectedAction(`/chat/${lady.id}`)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                  >
                    ✉️ Letter
                  </button>
                  <button
                    onClick={() => handleProtectedAction(`/chat/${lady.id}`)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                  >
                    👤 Profile
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (!isLoggedIn) setShowAuthModal(true);
                    else alert(`Liked ${lady.name}!`);
                  }}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold text-[11px] py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 border border-blue-200"
                >
                  💙 Like
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Auth Gate Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
