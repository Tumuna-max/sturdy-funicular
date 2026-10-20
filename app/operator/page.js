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

  // 1. Check Auth Session on Load
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setWorkerUser(user);
    }
    checkAuth();
  }, []);

  // 2. Fetch Host Profiles (Checking multiple possible image column names)
  useEffect(() => {
    if (!workerUser) return;

    async function fetchHosts() {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data && data.length > 0) {
        // Map image fields to ensure photos render
        const formattedHosts = data.map(h => ({
          ...h,
          resolvedImage: h.image_url || h.avatar_url || h.photo_url || h.image || ''
        }));
        setHosts(formattedHosts);
        setSelectedHost(formattedHosts[0]);
      }
    }
    fetchHosts();
  }, [workerUser]);

  // 3. Fetch All Messages (Diagnostic mode to verify data connection)
  useEffect(() => {
    if (!workerUser || !selectedHost) return;

    async function fetchHostChats() {
      // Fetch all messages to see what's in the database table
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const clientMap = new Map();
        
        data.forEach((msg) => {
          const clientId = msg.sender_id || msg.user_id || 'unknown-client';
          if (!clientMap.has(clientId)) {
            clientMap.set(clientId, {
              id: clientId,
              lastMessage: msg.content || '[Media/Empty]',
              time: msg.created_at,
              isNew: !msg.is_read
            });
          }
        });

        setActiveChats(Array.from(clientMap.values()));
      }
    }

    fetchHostChats();
  }, [workerUser, selectedHost]);

  // 4. Fetch Conversation History for Selected Client
  useEffect(() => {
    if (!selectedClient) return;

    async function fetchConversation() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${selectedClient.id},receiver_id.eq.${selectedClient.id},user_id.eq.${selectedClient.id}`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    }

    fetchConversation();
  }, [selectedClient]);

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

  // Send Reply Handler
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
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${selectedClient.id},receiver_id.eq.${selectedClient.id}`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    } else {
      alert('Error sending reply: ' + error.message);
    }
  };

  if (!workerUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <form onSubmit={handleWorkerLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-5">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800">🎧 Operator Portal</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your assigned worker credentials</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Worker Username / Email</label>
            <input
              type="text"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="e.g. operator1"
              required
              className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none"
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
              className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none"
            />
          </div>
          <button type="submit" disabled={loginLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">
            {loginLoading ? 'Signing in...' : 'Sign In to Operator Desk'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* 1. HOST PROFILES */}
      <div className="w-1/4 border-r border-slate-200 bg-white p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Host Profiles</h3>
          <button onClick={handleWorkerLogout} className="text-[10px] text-rose-600 font-bold hover:underline">Logout</button>
        </div>
        <div className="space-y-2">
          {hosts.map((host) => (
            <button
              key={host.id}
              onClick={() => {
                setSelectedHost(host);
                setSelectedClient(null);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                selectedHost?.id === host.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {host.resolvedImage ? (
                <img src={host.resolvedImage} alt={host.name} className="w-10 h-10 rounded-full object-cover shrink-0 border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {host.name ? host.name.substring(0, 2).toUpperCase() : 'HP'}
                </div>
              )}
              <div className="text-left overflow-hidden">
                <p className="font-bold text-sm truncate">{host.name}</p>
                <p className={`text-xs ${selectedHost?.id === host.id ? 'text-blue-100' : 'text-slate-500'}`}>Age {host.age}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. CLIENT CHATS */}
      <div className="w-1/4 border-r border-slate-200 bg-white p-4 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Client Chats (All)</h3>
        <div className="space-y-2">
          {activeChats.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No messages found in database.</p>
          ) : (
            activeChats.map((chat) => (
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

      {/* 3. CONVERSATION DESK */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50 p-6">
        <div>
          {selectedHost && (
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div>
                <span className="text-sm font-bold text-slate-700">Replying as: </span>
                <span className="text-sm font-extrabold text-blue-600">{selectedHost.name}</span>
              </div>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                Slots Remaining: 20 / 20
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
          {!selectedClient ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
              Select a client chat from the middle panel to view messages
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.is_operator_reply ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-2xl text-sm ${m.is_operator_reply ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                  <p>{m.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedClient && (
          <form onSubmit={handleSendReply} className="flex gap-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type reply as host..."
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white"
            />
            <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl">
              Send Reply
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
