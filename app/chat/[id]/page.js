'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ClientChatPage() {
  const params = useParams();
  const profileId = params?.id;

  const [hostProfile, setHostProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [user, setUser] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function initChat() {
      if (!profileId) return;

      // 1. Get logged in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // 2. Fetch host profile details
      const { data: host } = await supabase.from('profiles').select('*').eq('id', profileId).single();
      if (host) setHostProfile(host);

      // 3. Find existing conversation or create new one
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_id', profileId);

      let conv = existingConvs && existingConvs.length > 0 ? existingConvs[0] : null;

      if (!conv) {
        const { data: newConv, error: createErr } = await supabase
          .from('conversations')
          .insert([{ user_id: user.id, profile_id: profileId }])
          .select('*');

        if (newConv && newConv.length > 0) {
          conv = newConv[0];
        } else if (createErr) {
          console.error('Conversation create error:', createErr);
        }
      }

      if (conv) {
        setConversationId(conv.id);

        // 4. Fetch messages
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });

        if (msgs) setMessages(msgs);
      }
    }

    initChat();
  }, [profileId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSending(true);

    let currentConvId = conversationId;

    // Fallback: If conversation wasn't created yet, create it now
    if (!currentConvId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert([{ user_id: user.id, profile_id: profileId }])
        .select('*');

      if (newConv && newConv.length > 0) {
        currentConvId = newConv[0].id;
        setConversationId(currentConvId);
      }
    }

    if (!currentConvId) {
      alert('Could not establish conversation thread. Please refresh.');
      setSending(false);
      return;
    }

    // Insert Message
    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: currentConvId,
          sender_id: user.id,
          content: text
        }
      ])
      .select('*');

    if (!error && newMsg && newMsg.length > 0) {
      setMessages((prev) => [...prev, newMsg[0]]);
      setText('');
    } else {
      alert('Send failed: ' + (error?.message || 'Database error'));
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white p-6">
      {hostProfile && (
        <div className="flex items-center gap-3 border-b pb-4 mb-4">
          {hostProfile.image_url ? (
            <img src={hostProfile.image_url} alt={hostProfile.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center">
              {hostProfile.name?.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-bold text-lg text-slate-800">{hostProfile.name}, {hostProfile.age}</h2>
            <p className="text-xs text-emerald-600 font-semibold">Online now</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-slate-50 rounded-xl border">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
            Start a conversation with {hostProfile?.name || 'this host'}
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-2xl max-w-md text-sm ${m.sender_id === user?.id ? 'bg-blue-600 text-white' : 'bg-white border text-slate-800 shadow-sm'}`}>
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message (1 credit)..."
          className="flex-1 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition shadow"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
