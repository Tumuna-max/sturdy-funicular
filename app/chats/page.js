'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function ActiveChatsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const clientId = '1404449847';

  useEffect(() => {
    async function fetchActiveConversations() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Fetch all messages involving this client
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${clientId},receiver_id.eq.${clientId}`)
        .order('created_at', { ascending: false });

      if (!error && messages) {
        // Extract unique profile/lady IDs from messages
        const profileMap = new Map();

        messages.forEach((m) => {
          const profileId = m.profile_id || (m.sender_id === clientId ? m.receiver_id : m.sender_id);
          if (profileId && profileId !== clientId && !profileMap.has(profileId)) {
            profileMap.set(profileId, {
              lastMessage: m.content || 'Attachment sent',
              timestamp: m.created_at,
              unread: !m.is_read && m.sender_id !== clientId,
            });
          }
        });

        const profileIds = Array.from(profileMap.keys());

        if (profileIds.length > 0) {
          // Fetch profile details for these IDs
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', profileIds);

          if (profilesData) {
            const formatted = profilesData.map((p) => {
              const convoInfo = profileMap.get(p.id) || {};
              return {
                ...p,
                resolvedImg: p.image_url || p.avatar_url || p.image || p.photo_url || '',
                lastMessage: convoInfo.lastMessage,
                timestamp: convoInfo.timestamp,
                unread: convoInfo.unread,
              };
            });
            setConversations(formatted);
          }
        }
      }
      setLoading(false);
    }

    fetchActiveConversations();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-800">Active Conversations</h1>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading active chats...</div>
        ) : conversations.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <span className="text-5xl">💬</span>
            <h2 className="font-extrabold text-slate-800 text-lg">No Active Chats</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start a chat from any profile card to keep your conversations saved here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conversations.map((lady) => (
              <div
                key={lady.id}
                onClick={() => router.push(`/chat/${lady.id}`)}
                className="bg-white border border-slate-200 hover:border-blue-500 p-4 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4"
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={lady.resolvedImg || 'https://via.placeholder.com/150'} alt={lady.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-slate-800 text-sm truncate">{lady.name}, {lady.age}</h3>
                    <span className="text-[10px] text-slate-400">{new Date(lady.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1">{lady.lastMessage}</p>
                </div>
                {lady.unread && (
                  <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0 animate-pulse"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
