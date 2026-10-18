'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDataAndChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch user credits
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (userData) setCredits(userData.credits);

      // Fetch profiles the user has messaged
      const { data: messagesData } = await supabase
        .from('messages')
        .select('profile_id, message, created_at, profiles(id, name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (messagesData) {
        // Group unique profiles
        const uniqueMap = new Map();
        messagesData.forEach((item) => {
          if (item.profiles && !uniqueMap.has(item.profiles.id)) {
            uniqueMap.set(item.profiles.id, {
              ...item.profiles,
              lastMessage: item.message,
              lastTime: item.created_at,
            });
          }
        });
        setConversations(Array.from(uniqueMap.values()));
      }

      setLoading(false);
    };

    fetchUserDataAndChats();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold">Client Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-950 border border-gray-800 px-4 py-2 rounded-xl text-sm">
              <span className="text-pink-500 font-bold">{credits}</span> Credits Left
            </div>
            <Link
              href="/"
              className="bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-90 font-semibold text-sm px-4 py-2 rounded-xl transition"
            >
              Browse Profiles
            </Link>
          </div>
        </div>

        {/* Active Chats Section */}
        <h2 className="text-xl font-bold mb-4">Your Conversations</h2>
        {conversations.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">You haven't started any chats yet.</p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-pink-600 to-indigo-600 font-semibold text-sm px-6 py-3 rounded-xl transition"
            >
              Explore Profiles
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {conversations.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="bg-gray-900 border border-gray-800 hover:border-pink-500/50 rounded-2xl p-4 flex items-center gap-4 transition shadow-md"
              >
                <img
                  src={chat.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={chat.name}
                  className="w-14 h-14 rounded-full object-cover border border-pink-500/40"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-white">{chat.name}</h3>
                  <p className="text-gray-400 text-sm truncate mt-0.5">{chat.lastMessage}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(chat.lastTime).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
