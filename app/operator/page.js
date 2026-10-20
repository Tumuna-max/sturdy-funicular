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
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setWorkerUser(user);
    }
    checkAuth();
  }, []);

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

  useEffect(() => {
    if (!workerUser || !selectedHost) return;

    async function fetchHostConversations() {
      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .eq('profile_id', selectedHost.id);

      if (convs && convs.length > 0) {
        const userIds = convs.map(c => c.user_id);
        const { data: usersData } = await supabase.from('users').select('id, full_name, email').in('id', userIds);

        const convIds = convs.map(c => c.id);
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', convIds)
          .order('created_at', { ascending: false });

        const formatted = convs.map(c => {
          const clientUser = usersData?.find(u => u.id === c.user_id);
          const lastMsg = msgs?.find(m => m.conversation_id === c.id);
          return {
            ...c,
            clientName: clientUser?.full_name || clientUser?.email || `Client ${c.user_id.substring(0, 6)}`,
            lastMessage: lastMsg?.content || 'Started a new conversation'
          };
        });

        setConversations(formatted);
      } else {
        setConversations([]);
      }
    }

    fetchHostConversations();
  }, [workerUser, selectedHost]);

  useEffect(() => {
    if (!selectedConv) return;
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConv.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    }
    loadMessages();
  }, [selectedConv]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv || !selectedHost) return;

    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: selectedConv.id, sender_id: selectedHost.id, content: replyText }])
      .select()
      .single();

    if (!error && newMsg) {
      setMessages((prev) => [...prev, newMsg]);
      setReplyText('');
    } else {
      alert('Error sending reply: ' + error?.message);
    }
  };

  const handleWorkerLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const cleanEmail = loginEmail.includes('@') ? loginEmail : `${loginEmail.trim().toLowerCase()}@frumencedate.internal`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: loginPassword
    });

    if (error) alert('Login Failed: ' + error.message);
    else setWorkerUser(data.user);
    setLoginLoading(false);
  };

  if (!workerUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <form onSubmit={handleWorkerLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-4">
          <h2 className="text-2xl font-black text-slate-800 text-center">🎧 Operator Portal</h2>
          <input
            type="text"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="Worker Username"
            className="w-full border p-3 rounded-lg text-sm"
            required
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Password"
            className="w-full border p-3 rounded-lg text-sm"
            required
          />
          <button type="submit" disabled={loginLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">
            {loginLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* 1. HOST PROFILES */}
      <div className="w-1/4 border-r bg-white p-4 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">Host Profiles</h3>
        <div className="space-y-2">
          {hosts.map((host) => (
            <button
              key={host.id}
              onClick={() => { setSelectedHost(host); setSelectedConv(null); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl ${selectedHost?.id === host.id ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 hover:bg-slate-100'}`}
            >
              <img src={host.image_url} alt={host.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              <div className="text-left overflow-hidden">
                <p className="font-bold text-sm truncate">{host.name}</p>
                <p className={`text-xs ${selectedHost?.id === host.id ? 'text-blue-100' : 'text-slate-500'}`}>Age {host.age}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. CLIENT CHATS */}
      <div className="w-1/4 border-r bg-white p-4 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">Client Chats</h3>
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No active client chats for this host profile.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedConv(c)}
                className={`w-full text-left p-3 rounded-xl border ${selectedConv?.id === c.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                <p className="text-xs font-bold text-slate-800">{c.clientName}</p>
                <p className="text-xs text-slate-500 truncate mt-1">{c.lastMessage}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 3. MESSAGE DESK */}
      <div className="flex-1 flex flex-col justify-between p-6">
        {selectedHost && (
          <div className="border-b pb-3 mb-4">
            <span className="text-sm font-bold text-slate-700">Replying as: </span>
            <span className="text-sm font-extrabold text-blue-600">{selectedHost.name}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
          {!selectedConv ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
              Select a client chat from the middle panel to view messages
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender_id === selectedHost.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-2xl text-sm ${m.sender_id === selectedHost.id ? 'bg-blue-600 text-white' : 'bg-white border text-slate-800 shadow-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedConv && (
          <form onSubmit={handleSendReply} className="flex gap-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type reply as host..."
              className="flex-1 border rounded-xl p-3 text-sm bg-white"
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
