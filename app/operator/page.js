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
  const [clientChats, setClientChats] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');

  // 1. Auth Check
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setWorkerUser(user);
    }
    checkAuth();
  }, []);

  // 2. Fetch Hosts and calculate global unread counts per host
  useEffect(() => {
    if (!workerUser) return;

    async function fetchHostsAndUnreads() {
      const { data: profilesData } = await supabase.from('profiles').select('*');
      const { data: unreadMsgs } = await supabase
        .from('messages')
        .select('receiver_id, profile_id')
        .eq('is_read', false)
        .eq('is_operator_reply', false);

      if (profilesData && profilesData.length > 0) {
        const formattedHosts = profilesData.map((h) => {
          const unreadCount = unreadMsgs
            ? unreadMsgs.filter((m) => m.receiver_id === h.id || m.profile_id === h.id).length
            : 0;
          return {
            ...h,
            resolvedImg: h.image_url || h.avatar_url || h.image || h.photo_url || '',
            unreadCount: unreadCount
          };
        });

        setHosts(formattedHosts);
        if (!selectedHost) setSelectedHost(formattedHosts[0]);
      }
    }

    fetchHostsAndUnreads();

    // Realtime notification sync
    const channel = supabase
      .channel('operator-hosts-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchHostsAndUnreads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerUser, selectedHost]);

  // 3. Fetch Client Chats for Selected Host Profile
  useEffect(() => {
    if (!workerUser || !selectedHost) return;

    async function fetchHostChats() {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`receiver_id.eq.${selectedHost.id},profile_id.eq.${selectedHost.id},sender_id.eq.${selectedHost.id}`)
        .order('created_at', { ascending: false });

      if (msgs && msgs.length > 0) {
        const clientIds = Array.from(
          new Set(msgs.map((m) => (m.sender_id === selectedHost.id ? (m.receiver_id || m.profile_id) : m.sender_id)))
        ).filter(Boolean);

        const { data: usersData } = await supabase.from('users').select('id, full_name, email').in('id', clientIds);

        const chats = clientIds.map((cId) => {
          const clientUser = usersData?.find((u) => u.id === cId);
          const lastMsg = msgs.find((m) => m.sender_id === cId || m.receiver_id === cId || m.profile_id === cId);
          const isUnread = lastMsg && lastMsg.sender_id === cId && !lastMsg.is_read;

          return {
            id: cId,
            name: clientUser?.full_name || clientUser?.email || `Client: ${cId.substring(0, 8)}...`,
            lastMessage: lastMsg?.content || 'New Message',
            isUnread: isUnread
          };
        });

        setClientChats(chats);
      } else {
        setClientChats([]);
      }
    }

    fetchHostChats();

    const channel = supabase
      .channel('operator-chat-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchHostChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerUser, selectedHost]);

  // 4. Load Message Thread & Mark Messages as Read
  useEffect(() => {
    if (!selectedClient || !selectedHost) return;

    async function loadThreadAndMarkRead() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${selectedClient.id}),and(receiver_id.eq.${selectedClient.id}),and(profile_id.eq.${selectedClient.id})`)
        .order('created_at', { ascending: true });

      if (data) {
        const filtered = data.filter(
          (m) =>
            (m.sender_id === selectedHost.id && (m.receiver_id === selectedClient.id || m.profile_id === selectedClient.id)) ||
            (m.sender_id === selectedClient.id && (m.receiver_id === selectedHost.id || m.profile_id === selectedHost.id))
        );
        setMessages(filtered);

        // Mark incoming client messages as read in database
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('sender_id', selectedClient.id)
          .or(`receiver_id.eq.${selectedHost.id},profile_id.eq.${selectedHost.id}`);
      }
    }

    loadThreadAndMarkRead();
  }, [selectedClient, selectedHost]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedHost || !selectedClient) return;

    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: selectedHost.id,
          receiver_id: selectedClient.id,
          profile_id: selectedHost.id,
          content: replyText,
          is_operator_reply: true,
          is_read: true
        }
      ])
      .select('*');

    if (!error && newMsg && newMsg.length > 0) {
      setMessages((prev) => [...prev, newMsg[0]]);
      setReplyText('');
    } else {
      alert('Error sending reply: ' + (error?.message || 'Database error'));
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
              onClick={() => {
                setSelectedHost(host);
                setSelectedClient(null);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition ${
                selectedHost?.id === host.id ? 'bg-blue-600 text-white shadow' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={host.resolvedImg} alt={host.name} className="w-10 h-10 rounded-full object-cover shrink-0 border" />
                <div className="text-left overflow-hidden">
                  <p className="font-bold text-sm truncate">{host.name}</p>
                  <p className={`text-xs ${selectedHost?.id === host.id ? 'text-blue-100' : 'text-slate-500'}`}>Age {host.age}</p>
                </div>
              </div>
              {host.unreadCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {host.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CLIENT CHATS */}
      <div className="w-1/4 border-r bg-white p-4 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">Client Chats</h3>
        <div className="space-y-2">
          {clientChats.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No active client chats for this host profile.</p>
          ) : (
            clientChats.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  selectedClient?.id === c.id
                    ? 'border-blue-600 bg-blue-50'
                    : c.isUnread
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-800">{c.name}</p>
                  {c.isUnread && (
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                  )}
                </div>
                <p className={`text-xs truncate mt-1 ${c.isUnread ? 'font-bold text-rose-700' : 'text-slate-500'}`}>
                  {c.lastMessage}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 3. MESSAGE THREAD & REPLY DESK */}
      <div className="flex-1 flex flex-col justify-between p-6">
        {selectedHost && (
          <div className="border-b pb-3 mb-4 flex justify-between items-center">
            <div>
              <span className="text-sm font-bold text-slate-700">Replying as: </span>
              <span className="text-sm font-extrabold text-blue-600">{selectedHost.name}</span>
            </div>
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
              Operator Online
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
          {!selectedClient ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
              Select a client chat from the middle panel to view messages
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
              No message history found with this client.
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender_id === selectedHost.id ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md p-3 rounded-2xl text-sm ${
                    m.sender_id === selectedHost.id ? 'bg-blue-600 text-white' : 'bg-white border text-slate-800 shadow-sm'
                  }`}
                >
                  {m.content}
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
