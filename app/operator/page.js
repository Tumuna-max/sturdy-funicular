'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OperatorConsole() {
  const [workerUser, setWorkerUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [hosts, setHosts] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');

  // 1. Check existing session
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setWorkerUser(user);
      }
    }
    checkAuth();
  }, []);

  // 2. Fetch Host Profiles once logged in
  useEffect(() => {
    if (!workerUser) return;

    async function fetchHosts() {
      const { data } = await supabase.from('profiles').select('*');
      if (data && data.length > 0) {
        setHosts(data);
        setSelectedHost(data[0]);
      }
    }
    fetchHosts();
  }, [workerUser]);

  // 3. Fetch Chats & New Messages for Selected Host
  useEffect(() => {
    if (!workerUser || !selectedHost) return;

    async function fetchHostChats() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`receiver_id.eq.${selectedHost.id},sender_id.eq.${selectedHost.id}`)
        .order('created_at', { ascending: false });

      if (data) {
        const uniqueClientIds = Array.from(
          new Set(data.map((m) => (m.sender_id === selectedHost.id ? m.receiver_id : m.sender_id)))
        );

        const chats = uniqueClientIds.map((clientId) => {
          const clientMessages = data.filter(
            (m) => m.sender_id === clientId || m.receiver_id === clientId
          );
          const lastMsg = clientMessages[0];
          const hasUnread = clientMessages.some((m) => m.sender_id === clientId && !m.is_read);

          return {
            id: clientId,
            lastMessage: lastMsg?.content || '',
            time: lastMsg?.created_at,
            isNew: hasUnread
          };
        });

        setActiveChats(chats);
      }
    }

    fetchHostChats();

    const channel = supabase
      .channel('operator-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchHostChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerUser, selectedHost]);

  // Worker Login Handler
  const handleWorkerLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    const cleanEmail = loginEmail.includes('@')
      ? loginEmail
      : `${loginEmail.trim().toLowerCase()}@frumencedate.internal`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: loginPassword
    });

    if (error) {
      alert('Login Failed: ' + error.message);
    } else {
      setWorkerUser(data.user);
    }
    setLoginLoading(false);
  };

  const handleWorkerLogout = async () => {
    await supabase.auth.signOut();
    setWorkerUser(null);
  };

  // Reply Handler
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedHost || !selectedClient) return;

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: selectedHost.id,
        receiver_id: selectedClient.id,
        content: replyText,
        is_operator_reply: true,
        is_read: true
      }
    ]);

    if (!error) {
      setReplyText('');
    } else {
      alert('Error sending reply: ' + error.message);
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: WORKER LOGIN GATEWAY (Shown before login)
  // -------------------------------------------------------------
  if (!workerUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <form onSubmit={handleWorkerLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-5">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800">🎧 Operator Portal</h2>
            <p className="text-xs text-slate-500 mt-1">Please log in with your assigned worker credentials</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Worker Username / Email</label>
            <input
              type="text"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="e.g. operator1"
              required
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-md"
          >
            {loginLoading ? 'Signing in...' : 'Sign In to Operator Desk'}
          </button>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: OPERATOR CONSOLE (Shown after login)
  // -------------------------------------------------------------
  const newMessagesList = activeChats.filter((c) => c.isNew);
  const regularMessagesList = activeChats.filter((c) => !c.isNew);

  return (
    <div className="flex h-full min-h-screen bg-slate-50 text-slate-800">
      {/* 1. SELECT HOST PROFILE */}
      <div className="w-1/4 border-r border-slate-200 bg-white p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Host Profiles</h3>
          <button onClick={handleWorkerLogout} className="text-[10px] text-rose-600 font-bold hover:underline">
            Logout
          </button>
        </div>
        <div className="space-y-2">
          {hosts.map((host) => (
            <button
              key={host.id}
              onClick={() => setSelectedHost(host)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                selectedHost?.id === host.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {host.image_url ? (
                <img src={host.image_url} alt={host.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {host.name ? host.name.substring(0, 2).toUpperCase() : 'HP'}
                </div>
              )}
              <div className="text-left overflow-hidden">
                <p className="font-bold text-sm truncate">{host.name}</p>
                <p className={`text-xs ${selectedHost?.id === host.id ? 'text-blue-100' : 'text-slate-500'}`}>
                  Age {host.age}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. CLIENT CHATS & NEW MESSAGES */}
      <div className="w-1/4 border-r border-slate-200 bg-white p-4 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Client Chats</h3>

        {/* NEW UNREAD MESSAGES SECTION */}
        {newMessagesList.length > 0 && (
          <div className="mb-4 space-y-2">
            <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
              🔴 New Messages ({newMessagesList.length})
            </span>
            {newMessagesList.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedClient(chat)}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  selectedClient?.id === chat.id ? 'border-rose-600 bg-rose-50' : 'border-rose-300 bg-rose-50/50 hover:bg-rose-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-800">Client: {chat.id.substring(0, 8)}...</p>
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                </div>
                <p className="text-xs text-slate-600 truncate mt-1 font-semibold">{chat.lastMessage}</p>
              </button>
            ))}
          </div>
        )}

        {/* REGULAR CHATS SECTION */}
        <div className="space-y-2">
          {regularMessagesList.length === 0 && newMessagesList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No active chats for this host.</p>
          ) : (
            regularMessagesList.map((chat) => (
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
            ))
          )}
        </div>
      </div>

      {/* 3. CHAT RESPONSE DESK */}
      <div className="flex-1 flex flex-col justify-between p-6">
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
          <p className="text-sm text-slate-500">Select a host profile to view conversations.</p>
        )}

        <form onSubmit={handleSendReply} className="flex gap-3 mt-auto">
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
