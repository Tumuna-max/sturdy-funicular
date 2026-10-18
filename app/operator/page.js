'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OperatorDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMsg, setReplyMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncomingChats();
  }, []);

  const fetchIncomingChats = async () => {
    const { data } = await supabase
      .from('messages')
      .select('user_id, profile_id, message, created_at, profiles(name), users(email)')
      .order('created_at', { ascending: false });

    if (data) {
      const unique = new Map();
      data.forEach((item) => {
        const key = `${item.user_id}-${item.profile_id}`;
        if (!unique.has(key)) {
          unique.set(key, {
            userId: item.user_id,
            profileId: item.profile_id,
            profileName: item.profiles?.name || 'Host',
            clientEmail: item.users?.email || 'Client',
            lastMessage: item.message,
          });
        }
      });
      setConversations(Array.from(unique.values()));
    }
    setLoading(false);
  };

  const loadChat = async (chat) => {
    setSelectedChat(chat);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', chat.userId)
      .eq('profile_id', chat.profileId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyMsg.trim() || !selectedChat) return;

    const { error } = await supabase.from('messages').insert([
      {
        user_id: selectedChat.userId,
        profile_id: selectedChat.profileId,
        sender: 'operator',
        message: replyMsg,
      },
    ]);

    if (!error) {
      setReplyMsg('');
      loadChat(selectedChat);
    } else {
      alert('Failed to send reply');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading Console...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex border-t border-gray-800">
      {/* Sidebar - Inbox List */}
      <div className="w-1/3 border-r border-gray-800 p-4 space-y-3">
        <h1 className="font-bold text-xl mb-4">Operator Console</h1>
        {conversations.map((c) => (
          <div
            key={`${c.userId}-${c.profileId}`}
            onClick={() => loadChat(c)}
            className={`p-3 rounded-xl border cursor-pointer transition ${
              selectedChat?.userId === c.userId && selectedChat?.profileId === c.profileId
                ? 'bg-pink-600/20 border-pink-500'
                : 'bg-gray-900 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="font-bold text-sm text-pink-400">To: {c.profileName}</div>
            <div className="text-xs text-gray-400">From: {c.clientEmail}</div>
            <p className="text-xs text-gray-300 truncate mt-1">{c.lastMessage}</p>
          </div>
        ))}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between p-6">
        {selectedChat ? (
          <>
            <div className="border-b border-gray-800 pb-3">
              <h2 className="font-bold">Replying as <span className="text-pink-500">{selectedChat.profileName}</span></h2>
              <p className="text-xs text-gray-400">Client: {selectedChat.clientEmail}</p>
            </div>

            <div className="flex-1 my-4 overflow-y-auto space-y-3 pr-2 max-h-[65vh]">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${m.sender === 'operator' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                    {m.message}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendReply} className="flex gap-2">
              <input
                type="text"
                value={replyMsg}
                onChange={(e) => setReplyMsg(e.target.value)}
                placeholder="Type your reply as host..."
                className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 font-semibold px-6 py-3 rounded-xl text-sm transition">
                Reply
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a conversation from the sidebar to reply.
          </div>
        )}
      </div>
    </div>
  );
}
