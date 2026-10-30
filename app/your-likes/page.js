'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function getClientUuid() {
  if (typeof window === 'undefined') return 'a0000000-0000-0000-0000-000000000001';
  let id = localStorage.getItem('frumence_client_uuid');
  if (!id) {
    id = 'a' + crypto.randomUUID().slice(1);
    localStorage.setItem('frumence_client_uuid', id);
  }
  return id;
}

export default function YourLikesPage() {
  const router = useRouter();
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const clientId = getClientUuid();

  useEffect(() => {
    async function fetchLikesAndProfiles() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*');
      if (profileData) {
        setAllProfiles(
          profileData.map((p) => ({
            ...p,
            resolvedImg: p.image_url || p.avatar_url || p.image || p.photo_url || ''
          }))
        );
      }

      const { data: likeData } = await supabase
        .from('likes')
        .select('profile_id')
        .eq('client_id', clientId);

      if (likeData && likeData.length > 0 && profileData) {
        const likedIds = likeData.map((l) => l.profile_id);
        setLikedProfiles(profileData.filter((p) => likedIds.includes(p.id)));
      }

      setLoading(false);
    }
    fetchLikesAndProfiles();
  }, [clientId]);

  // Operator action to force-add/remove a like
  const handleOperatorToggleLike = async (profileId) => {
    const isAlreadyLiked = likedProfiles.some((p) => p.id === profileId);

    if (isAlreadyLiked) {
      await supabase.from('likes').delete().match({ client_id: clientId, profile_id: profileId });
      setLikedProfiles((prev) => prev.filter((p) => p.id !== profileId));
    } else {
      await supabase.from('likes').insert([{ client_id: clientId, profile_id: profileId }]);
      const added = allProfiles.find((p) => p.id === profileId);
      if (added) setLikedProfiles((prev) => [...prev, added]);
    }
  };

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

        <h1 className="text-2xl font-black text-slate-800">Your Likes & Operator Management</h1>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading liked profiles...</div>
        ) : likedProfiles.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <span className="text-5xl">❤️</span>
            <h2 className="font-extrabold text-slate-800 text-lg">No Likes Registered</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Profiles you or your operator like will appear here. You can also toggle likes on any profile below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {likedProfiles.map((lady) => (
              <div key={lady.id} className="bg-white border border-slate-200 rounded-3xl p-3 space-y-3 shadow-sm">
                <div className="relative h-60 rounded-2xl overflow-hidden bg-slate-100">
                  <img src={lady.resolvedImg || 'https://via.placeholder.com/300'} alt={lady.name} className="w-full h-full object-cover" />
                </div>
                <div className="px-1">
                  <h3 className="font-extrabold text-slate-800 text-sm">{lady.name}, {lady.age}</h3>
                  <p className="text-xs text-slate-400">{lady.location || 'Mombasa, Kenya'}</p>
                </div>
                <button
                  onClick={() => handleOperatorToggleLike(lady.id)}
                  className="w-full bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                >
                  ❤️ Liked (Click to Remove)
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Operator Section to Add Likes */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm mt-8">
          <h2 className="font-extrabold text-slate-800 text-sm">Operator Control: Manage All Profiles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allProfiles.map((lady) => {
              const isLiked = likedProfiles.some((p) => p.id === lady.id);
              return (
                <div key={lady.id} className="border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center space-y-2 bg-slate-50">
                  <img src={lady.resolvedImg} alt={lady.name} className="w-12 h-12 rounded-full object-cover" />
                  <p className="text-xs font-bold truncate w-full">{lady.name}</p>
                  <button
                    onClick={() => handleOperatorToggleLike(lady.id)}
                    className={`w-full font-bold text-[10px] py-1.5 rounded-lg transition ${
                      isLiked ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isLiked ? 'Unlike' : 'Like Profile'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
