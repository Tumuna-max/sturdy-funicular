'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OperatorConsole() {
  const [hosts, setHosts] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');

  // 1. Fetch Host Profiles
  useEffect(() => {
    async function fetchHosts() {
      const { data } = await supabase.from('profiles').select('*');
      if (data && data.length > 0) {
        setHosts(data);
        setSelectedHost(data[0]); // Select first host by default
      }
    }
    fetchHosts();
  }, []);

  // 2. Fetch Active Client Chats whenever Selected Host changes
  useEffect(() => {
    if (!selectedHost) return;

    async function fetchHostChats() {
      // Get distinct clients who messaged this host
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, created_at, content')
        .eq('receiver_id', selectedHost.id)
        .order('created_at', { ascending: false });

      if (data) {
        // Group messages by client ID
        const uniqueClients = Array.from(new Set(data.map(m => m.sender_id)))
          .map(id => {
            return {
              id,
              lastMessage: data.find(m => m.sender_id === id)?.content
            };
          });
        setActiveChats(uniqueClients);
      }
    }

    fetchHostChats();

    // Subscribe to new incoming messages in real-time
    const channel = supabase
      .channel('operator-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchHostChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedHost]);

  // 3. Send Reply as Host
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedHost || !selectedClient) return;

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: selectedHost.id,
        receiver_id: selectedClient.id,
        content: replyText,
        is_operator_reply: true
      }
    ]);

    if (!error) {
      setReplyText('');
    } else {
      alert('Error sending reply: ' + error.message);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      {/* 1. SELECT HOST PROFILE */}
      <div className="w-1/4 border-r border-slate-200 bg-white p-4 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Select Host Profile</h3>
        <div className="space-y-2">
          {hosts.map((host) => (
            <button
              key={host.id}
              onClick={() => setSelectedHost(host)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                selectedHost?.id === host.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <img src={host.image_url} alt={host.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="text-left">
                <p className="font-bold text-sm">{host.name}</p>
                <p className={`text-xs ${selectedHost?.id === host.id ? 'text-blue-100' : 'text-slate-500'}`}>
                  Age {host.age}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. MALE CLIENT CHATS */}
      <div className="w-1/4 border-r border-slate-200 bg-white p-4 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Male Client Chats</h3>
        {activeChats.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No active chats for this host.</p>
        ) : (
          <div className="space-y-2">
            {activeChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedClient(chat)}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  selectedClient?.id === chat.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs font-bold text-slate-700 truncate">Client: {chat.id.substring(0, 8)}...</p>
                <p className="text-xs text-slate-500 truncate mt-1">{chat.lastMessage}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. CHAT CONVERSATION & REPLY DESK */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50 p-6">
        <div>
          {selectedHost ? (
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div>
                <span className="text-sm font-bold text-slate-700">Replying as: </span>
                <span className="text-sm font-extrabold text-blue-600">{selectedHost.name}</span>
              </div>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                Slots Remaining: 20 / 20
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a host profile to start replying.</p>
          )}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSendReply} className="flex gap-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type reply as host..."
            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md"
          >
            Send Reply
          </button>
        </form>
      </div>
    </div>
  );
}
