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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) {
        setProfiles(data);
      }
      setLoading(false);
    }
    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="animate-pulse text-gray-400">Loading host profiles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Discover Hosts
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Connect and chat live with available host profiles right now.
          </p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-pink-500/50 transition duration-300 shadow-lg flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] w-full bg-gray-800 overflow-hidden">
                <img
                  src={
                    profile.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80'
                  }
                  alt={profile.name}
                  className="w-full h-full object-cover object-center hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 right-3 bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md shadow-md">
                  Online
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {profile.name}, {profile.age}
                  </h3>
                  <p className="text-xs text-pink-400 font-medium">{profile.location}</p>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-2">
                    {profile.bio}
                  </p>
                </div>

                <Link
                  href={`/chat/${profile.id}`}
                  className="mt-4 w-full block text-center bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-md"
                >
                  Start Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
