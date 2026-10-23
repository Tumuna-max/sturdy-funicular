'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ActiveChatsPage() {
  const [user, setUser] = useState(null);
  const [activeConversations, setActiveConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActiveChats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      // Fetch all messages involving this client
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id},profile_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (msgs && msgs.length > 0) {
        // Extract unique host profile IDs the client has chatted with
        const hostIds = Array.from(
          new Set(
            msgs.map((m) => (m.sender_id === user.id ? (m.receiver_id || m.profile_id) : m.sender_id))
          )
        ).filter(Boolean);

        // Fetch host profile details
        const { data: profilesData } = await supabase.from('profiles').select('*').in('id', hostIds);

        const convs = hostIds.map((hId) => {
          const profile = profilesData?.find((p) => p.id === hId);
          const lastMsg = msgs.find(
            (m) =>
              (m.sender_id === user.id && (m.receiver_id === hId || m.profile_id === hId)) ||
              (m.sender_id === hId && (m.receiver_id === user.id || m.profile_id === user.id))
          );
          const isUnread = lastMsg && lastMsg.sender_id !== user.id && !lastMsg.is_read;

          return {
            id: hId,
            name: profile?.name || 'Host Profile',
            image: profile?.image_url || profile?.avatar_url || profile?.image || '',
            age: profile?.age || '',
            lastMessage: lastMsg?.content || 'No messages yet',
            time: lastMsg?.created_at,
            isUnread: isUnread
          };
        });

        setActiveConversations(convs);
      }
      setLoading(false);
    }

    loadActiveChats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm mt-6 border border-slate-200">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">⚡ Active Chats</h1>
          <p className="text-xs text-slate-500 mt-1">Ongoing conversations with host profiles</p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 italic text-center py-10">Loading active chats...</p>
      ) : activeConversations.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-sm text-slate-500 italic">You have no active conversations yet.</p>
          <Link href="/" className="inline-block bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs">
            Browse Profiles & Start Chatting
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activeConversations.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                chat.isUnread ? 'border-rose-500 bg-rose-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                {chat.image ? (
                  <img src={chat.image} alt={chat.name} className="w-12 h-12 rounded-full object-cover border shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0">
                    {chat.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-800">
                      {chat.name}, {chat.age}
                    </h3>
                    {chat.isUnread && (
                      <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                        New Message
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 truncate max-w-md ${chat.isUnread ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>

              <span className="bg-blue-50 text-blue-600 font-bold text-xs px-4 py-2 rounded-xl">
                Open Chat
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
