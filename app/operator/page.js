'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function OperatorPage() {
  const [hosts, setHosts] = useState([]);
  const [selectedHostId, setSelectedHostId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'letters'
  const [clientLikes, setClientLikes] = useState({});
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // 1. Fetch Host Profiles once on mount
  useEffect(() => {
    async function fetchHosts() {
      if (!supabase) return;
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setHosts(
          data.map((p) => ({
            ...p,
            resolvedImg: p.image_url || p.avatar_url || p.image || p.photo_url || ''
          }))
        );
        // Default to first host only if no host is selected yet
        setSelectedHostId((prev) => prev || data[0].id);
      }
    }
    fetchHosts();
  }, []);

  // 2. Fetch conversations for the selected host
  useEffect(() => {
    async function fetchHostChats() {
      if (!supabase || !selectedHostId) return;

      const { data: allMsg } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${selectedHostId},receiver_id.eq.${selectedHostId},profile_id.eq.${selectedHostId}`)
        .order('created_at', { ascending: false });

      if (allMsg) {
        const clientMap = new Map();
        allMsg.forEach((m) => {
          const clientId = m.profile_id === selectedHostId ? m.sender_id : (m.sender_id === selectedHostId ? m.receiver_id : m.sender_id);
          const isLetter = m.content?.includes('[LETTER');

          if (clientId && clientId !== selectedHostId && !clientMap.has(clientId)) {
            clientMap.set(clientId, {
              clientId,
              lastMessage: m.content,
              isLetter,
              timestamp: m.created_at
            });
          }
        });

        const list = Array.from(clientMap.values());
        setConversations(list);

        if (list.length > 0) {
          setSelectedClientId((prev) => {
            const exists = list.some((c) => c.clientId === prev);
            return exists ? prev : list[0].clientId;
          });
        } else {
          setSelectedClientId(null);
        }
      }
    }

    fetchHostChats();
  }, [selectedHostId]);

  // 3. Fetch message thread for current host + client pair
  useEffect(() => {
    async function fetchThread() {
      if (!supabase || !selectedHostId || !selectedClientId) {
        setMessages([]);
        return;
      }

      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (data) {
        const filtered = data.filter(
          (m) =>
            (m.sender_id === selectedHostId && m.receiver_id === selectedClientId) ||
            (m.sender_id === selectedClientId && (m.receiver_id === selectedHostId || m.profile_id === selectedHostId))
        );
        setMessages(filtered);
      }
    }

    fetchThread();
  }, [selectedHostId, selectedClientId]);

  // Handle sending reply as host
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !supabase || !selectedHostId || !selectedClientId) return;

    const content = replyText;
    setReplyText('');

    const payload = {
      sender_id: selectedHostId,
      receiver_id: selectedClientId,
      profile_id: selectedHostId,
      content: content,
      is_read: false,
      is_operator_reply: true
    };

    const { data, error } = await supabase.from('messages').insert([payload]).select('*');

    if (!error && data) {
      setMessages((prev) => [...prev, data[0]]);
    }
  };

  // Operator sends a protected photo message
  const handleSendPhoto = async () => {
    if (!photoUrlInput.trim() || !supabase || !selectedHostId || !selectedClientId) return;

    const payload = {
      sender_id: selectedHostId,
      receiver_id: selectedClientId,
      profile_id: selectedHostId,
      content: '📸 Sent a photo',
      media_url: photoUrlInput,
      is_read: false,
      is_operator_reply: true
    };

    const { data, error } = await supabase.from('messages').insert([payload]).select('*');

    if (!error && data) {
      setMessages((prev) => [...prev, data[0]]);
      setPhotoUrlInput('');
      setShowPhotoModal(false);
    }
  };

  const toggleClientLike = async () => {
    if (!selectedClientId) return;
    const current = clientLikes[selectedClientId];
    setClientLikes((prev) => ({ ...prev, [selectedClientId]: !current }));
  };

  const selectedHost = hosts.find((h) => h.id === selectedHostId);

  // Separate messages into regular chat vs letters
  const filteredMessages = messages.filter((m) => {
    const isLetter = m.content?.includes('[LETTER');
    return activeTab === 'letters' ? isLetter : !isLetter;
  });

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* COLUMN 1: HOST PROFILES */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">Host Profiles</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {hosts.map((host) => {
            const isSelected = host.id === selectedHostId;
            return (
              <div
                key={host.id}
                onClick={() => setSelectedHostId(host.id)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition ${
                  isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <img src={host.resolvedImg || 'https://via.placeholder.com/100'} alt={host.name} className="w-9 h-9 rounded-full object-cover shrink-0 border" />
                <div className="overflow-hidden">
                  <p className="text-xs truncate">{host.name}</p>
                  <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>Age {host.age}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUMN 2: CLIENT CHATS & LETTERS LIST */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">Client Messages</h2>
          {/* View switcher between Chat & Letters */}
          <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-2.5 py-1 rounded-md transition ${activeTab === 'chats' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('letters')}
              className={`px-2.5 py-1 rounded-md transition ${activeTab === 'letters' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
            >
              Letters
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No conversation threads found.</div>
          ) : (
            conversations.map((c) => {
              const isSelected = c.clientId === selectedClientId;
              return (
                <div
                  key={c.clientId}
                  onClick={() => setSelectedClientId(c.clientId)}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800">Client ID: {c.clientId.slice(0, 8)}...</span>
                    <span className="text-[9px] text-slate-400">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 3: OPERATOR WORKSPACE */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50">
        {/* Workspace Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Replying as Host:</span>
            <h1 className="text-base font-black text-blue-600">{selectedHost?.name || 'Select Host'}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleClientLike}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                clientLikes[selectedClientId]
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {clientLikes[selectedClientId] ? '❤️ Client Liked' : '💙 Like Client'}
            </button>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-full">
              Operator Active
            </span>
          </div>
        </div>

        {/* Message / Letter Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-12">
              No {activeTab === 'letters' ? 'letters' : 'chat messages'} in this thread.
            </div>
          ) : (
            filteredMessages.map((m, idx) => {
              const isOperator = m.is_operator_reply || m.sender_id === selectedHostId;
              const isLetter = m.content?.includes('[LETTER');

              return (
                <div key={idx} className={`flex ${isOperator ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg p-4 rounded-2xl text-xs font-medium shadow-sm ${
                    isLetter
                      ? 'bg-amber-50 border border-amber-200 text-amber-900 w-full'
                      : isOperator
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <span className={`block text-[9px] mt-1 text-right ${isOperator && !isLetter ? 'text-blue-100' : 'text-slate-400'}`}>
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Input & Photo Attachment Toolbar */}
        <div className="bg-white p-4 border-t border-slate-200 space-y-3">
          <form onSubmit={handleSendReply} className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs px-3 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              📷 Photo
            </button>

            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Type reply as ${selectedHost?.name || 'host'}...`}
              className="flex-1 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-blue-600 bg-slate-50"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer shadow-md"
            >
              Send Reply
            </button>
          </form>
        </div>

        {/* Modal: Attach Protected Photo */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800">Send Photo Attachment</h3>
              <p className="text-xs text-slate-500">Paste an image URL below to send as a locked photo (5 credits to unlock).</p>
              <input
                type="text"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full border p-3 rounded-xl text-xs outline-none bg-slate-50"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendPhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl"
                >
                  Send Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
