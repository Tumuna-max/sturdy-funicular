'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OperatorConsole() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [slots, setSlots] = useState(20);
  const [operatorId, setOperatorId] = useState(null);

  useEffect(() => {
    async function initOperator() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setOperatorId(user.id);
        const { data: userData } = await supabase
          .from('users')
          .select('operator_slots')
          .eq('id', user.id)
          .single();
        if (userData && userData.operator_slots !== null) {
          setSlots(userData.operator_slots);
        }
      }

      // Load all host profiles assigned for operator selection
      const { data: hostData } = await supabase.from('profiles').select('*').order('name');
      if (hostData) {
        setProfiles(hostData);
        setSelectedProfile(hostData[0]);
      }
    }
    initOperator();
  }, []);

  // Fetch client chats for selected host profile
  useEffect(() => {
    if (!selectedProfile) return;

    async function loadConversations() {
      const { data } = await supabase
        .from('messages')
        .select('user_id, created_at, message')
        .eq('profile_id', selectedProfile.id)
        .order('created_at', { ascending: false });

      if (data) {
        // Group unique male client IDs
        const uniqueClients = Array.from(new Set(data.map((m) => m.user_id)));
        setConversations(uniqueClients);
        if (uniqueClients.length > 0 && !selectedClient) {
          setSelectedClient(uniqueClients[0]);
        }
      }
    }

    loadConversations();
  }, [selectedProfile]);

  // Load chat history & check if male client replied to reset slots to 20
  useEffect(() => {
    if (!selectedProfile || !selectedClient) return;

    async function fetchChat() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('profile_id', selectedProfile.id)
        .eq('user_id', selectedClient)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);

        // RESET LOGIC: If the last message received was sent by the male client, reset worker slots to 20
        const lastMessage = data[data.length - 1];
        if (lastMessage && lastMessage.sender === 'client' && operatorId) {
          await supabase.from('users').update({ operator_slots: 20 }).eq('id', operatorId);
          setSlots(20);
        }
      }
    }

    fetchChat();
  }, [selectedProfile, selectedClient, operatorId]);

  const handleSendOperatorMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProfile || !selectedClient) return;

    if (slots <= 0) {
      alert('You have 0 messages left! You must wait for a male client to reply to reset your quota to 20.');
      return;
    }

    // Insert operator reply as host profile
    const { error } = await supabase.from('messages').insert([
      {
        profile_id: selectedProfile.id,
        user_id: selectedClient,
        sender: 'host',
        message: newMessage,
      },
    ]);

    if (!error) {
      const newSlotCount = slots - 1;
      setSlots(newSlotCount);
      setMessages([...messages, { sender: 'host', message: newMessage, id: Date.now() }]);
      setNewMessage('');

      // Deduct 1 slot from operator's balance
      if (operatorId) {
        await supabase.from('users').update({ operator_slots: newSlotCount }).eq('id', operatorId);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] m-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      
      {/* 1. Host Profile Selection Column */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 p-4 space-y-4 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Select Host Profile
        </h3>
        <div className="space-y-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProfile(p);
                setSelectedClient(null);
              }}
              className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition ${
                selectedProfile?.id === p.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <img src={p.avatar_url} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
              <div className="truncate text-xs">
                <p className="font-semibold">{p.name}</p>
                <p className={selectedProfile?.id === p.id ? 'text-blue-100' : 'text-slate-400'}>
                  Age {p.age}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Active Client Conversations List */}
      <div className="w-64 border-r border-slate-200 bg-white p-4 space-y-4 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Male Client Chats
        </h3>
        {conversations.length === 0 ? (
          <p className="text-xs text-slate-400">No active chats for this host.</p>
        ) : (
          conversations.map((clientId) => (
            <button
              key={clientId}
              onClick={() => setSelectedClient(clientId)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                selectedClient === clientId
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              Client ID: {clientId.substring(0, 8)}...
            </button>
          ))
        )}
      </div>

      {/* 3. Main Chat & Slot Status Workspace */}
      <div className="flex-1 flex flex-col bg-slate-50">
        
        {/* Top Console Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Replying as: <span className="text-blue-600">{selectedProfile?.name}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Active Client ID: {selectedClient ? selectedClient.substring(0, 8) : 'None'}
            </p>
          </div>

          {/* Available Worker Message Slots Indicator */}
          <div className={`px-4 py-2 rounded-xl text-xs font-extrabold border ${
            slots > 5 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            Slots Remaining: {slots} / 20
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id || Math.random()}
              className={`flex ${m.sender === 'host' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-2xl text-sm ${
                  m.sender === 'host'
                    ? 'bg-slate-800 text-white rounded-br-sm'
                    : 'bg-white text-slate-900 border border-slate-200 shadow-sm rounded-bl-sm'
                }`}
              >
                {m.message}
              </div>
            </div>
          ))}
        </div>

        {/* Operator Message Form */}
        <form onSubmit={handleSendOperatorMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              slots > 0
                ? 'Type reply as host...'
                : 'Quota reached (0/20). Waiting for male client reply to reset slots to 20...'
            }
            disabled={slots <= 0}
            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={slots <= 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
          >
            Send Reply
          </button>
        </form>

      </div>

    </div>
  );
}
