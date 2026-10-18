'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DatingHome() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      // Fetching lady profiles from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (!error && data) {
        setProfiles(data);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Discover</h1>
            <p className="text-gray-400 text-sm mt-1">Connect and chat with profiles online now.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20 bg-[#111827] rounded-3xl border border-gray-800">
            <p className="text-gray-400">No profiles found yet. Add them in Supabase to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <Link 
                key={profile.id} 
                href={`/chat/${profile.id}`}
                className="group relative bg-[#111827] rounded-3xl overflow-hidden border border-gray-800 hover:border-pink-500/50 transition-all duration-300 shadow-xl flex flex-col h-[400px]"
              >
                {/* Profile Image */}
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                    alt={profile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/30" />
                  
                  {/* Online Badge */}
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-300">Online</span>
                  </div>

                  {/* Profile Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {profile.name}, <span className="font-normal text-gray-300">{profile.age || '23'}</span>
                    </h2>
                    <p className="text-gray-300 text-xs mt-1 line-clamp-2">{profile.bio || 'Say hi and start a conversation...'}</p>
                    <div className="mt-4 w-full py-2.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-center font-semibold text-xs rounded-xl shadow-lg transition">
                      Start Chat
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
