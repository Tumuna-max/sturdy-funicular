'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';
import ProfileDetailModal from '@/components/ProfileDetailModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function HomePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [likedProfiles, setLikedProfiles] = useState({});

  const clientId = '1404449847';

  useEffect(() => {
    async function fetchProfilesAndLikes() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileData) {
        setProfiles(
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

      if (likeData) {
        const likedMap = {};
        likeData.forEach((l) => {
          likedMap[l.profile_id] = true;
        });
        setLikedProfiles(likedMap);
      }

      setLoading(false);
    }

    fetchProfilesAndLikes();
  }, []);

  const handleStartChat = async (lady) => {
    if (!supabase) return;

    // Ensure a conversation record / initial message exists so it shows up in All Chats (/chats)
    const { data: existing } = await supabase
      .from('messages')
      .select('id')
      .or(`and(sender_id.eq.${clientId},profile_id.eq.${lady.id}),and(sender_id.eq.${lady.id},profile_id.eq.${clientId})`)
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from('messages').insert([
        {
          sender_id: clientId,
          receiver_id: lady.id,
          profile_id: lady.id,
          content: 'Hi! I saw your profile and wanted to chat.',
          is_read: false,
          is_operator_reply: false
        }
      ]);
    }

    // Redirect straight to All Chats page as requested
    router.push('/chats');
  };

  const handleWriteLetter = (lady) => {
    router.push(`/letters?to=${lady.id}`);
  };

  const toggleLike = async (profileId, e) => {
    e.stopPropagation();
    if (!supabase) return;

    if (likedProfiles[profileId]) {
      await supabase.from('likes').delete().match({ client_id: clientId, profile_id: profileId });
      setLikedProfiles((prev) => ({ ...prev, [profileId]: false }));
    } else {
      await supabase.from('likes').insert([{ client_id: clientId, profile_id: profileId }]);
      setLikedProfiles((prev) => ({ ...prev, [profileId]: true }));
    }
  };

  const filteredProfiles = profiles.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.id).includes(searchQuery)
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 bg-white p-3 px-4 rounded-2xl border border-slate-200 shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID or name"
            className="w-full text-sm outline-none bg-transparent text-slate-700"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400 text-sm">Loading profiles...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">No profiles found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProfiles.map((lady) => {
              const isLiked = likedProfiles[lady.id];
              return (
                <div
                  key={lady.id}
                  className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 p-3 flex flex-col justify-between space-y-3"
                >
                  <div 
                    onClick={() => setSelectedProfile(lady)}
                    className="relative h-72 rounded-2xl bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={lady.resolvedImg || 'https://via.placeholder.com/400x500'}
                      alt={lady.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/25 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      I'm online now
                    </div>
                  </div>

                  <div className="px-1">
                    <h3 className="font-extrabold text-slate-800 text-base">{lady.name}, {lady.age}</h3>
                    <p className="text-xs text-slate-400 font-medium">{lady.location || 'Mombasa, Kenya'}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button 
                      onClick={() => handleStartChat(lady)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] py-2 rounded-xl shadow transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      💬 Chat
                    </button>
                    <button 
                      onClick={() => handleWriteLetter(lady)}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      ✉️ Letter
                    </button>
                    <button
                      onClick={() => setSelectedProfile(lady)}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      👤 Profile
                    </button>
                  </div>

                  <button
                    onClick={(e) => toggleLike(lady.id, e)}
                    className={`w-full border font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isLiked ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    {isLiked ? '💚 Liked' : '💙 Like'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedProfile && (
        <ProfileDetailModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </div>
  );
}
