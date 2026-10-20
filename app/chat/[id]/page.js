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

  useEffect(() => {
    async function initChat() {
      if (!profileId) return;

      // 1. Get logged in client user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // 2. Load the host profile details
      const { data: host } = await supabase.from('profiles').select('*').eq('id', profileId).single();
      if (host) setHostProfile(host);

      // 3. Find or Create Conversation thread for this exact profile ID
      let { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .maybeSingle();

      if (!conv) {
        const { data: newConv, error: createErr } = await supabase
          .from('conversations')
          .insert([{ user_id: user.id, profile_id: profileId }])
          .select()
          .single();
        
        if (!createErr) conv = newConv;
      }

      if (conv) {
        setConversationId(conv.id);

        // 4. Fetch existing messages
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
    if (!text.trim() || !conversationId || !user) return;

    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: user.id,
          content: text
        }
      ])
      .select()
      .single();

    if (!error && newMsg) {
      setMessages((prev) => [...prev, newMsg]);
      setText('');
    } else {
      alert('Error sending message: ' + (error?.message || 'Check database connection'));
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white p-6">
      {hostProfile && (
        <div className="flex items-center gap-3 border-b pb-4 mb-4">
          <img src={hostProfile.image_url} alt={hostProfile.name} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <h2 className="font-bold text-lg text-slate-800">{hostProfile.name}, {hostProfile.age}</h2>
            <p className="text-xs text-emerald-600 font-semibold">Online now</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2 bg-slate-50 rounded-xl border">
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
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition shadow">
          Send
        </button>
      </form>
    </div>
  );
}
