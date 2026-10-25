'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function UnreadPage() {
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnread() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUnreadMessages(data);
      }
      setLoading(false);
    }
    fetchUnread();
  }, []);

  const handleOpenChat = async (msg) => {
    const targetProfileId = msg.profile_id || msg.sender_id;
    if (targetProfileId) {
      // Mark message as read when clicked
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', msg.id);

      router.push(`/chat/${targetProfileId}`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-800">Unread Messages</h1>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading unread messages...</div>
        ) : unreadMessages.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <span className="text-5xl">🏳️</span>
            <h2 className="font-extrabold text-slate-800 text-lg">All Messages Read</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You don't have any unread notifications or messages right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {unreadMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenChat(msg)}
                className="bg-white border border-rose-200 bg-rose-50/30 p-4 rounded-2xl shadow-sm flex justify-between items-center cursor-pointer hover:bg-rose-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{msg.content || 'New attachment'}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(msg.created_at).toLocaleString()} • Click to open chat</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
