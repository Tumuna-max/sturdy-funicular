'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ClientChatPage() {
  const { id: profileId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function initChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // 1. Get or Create Conversation between Client and Host Profile
      let { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user_id.eq.${user.id},profile_id.eq.${profileId}),and(user_id.eq.${profileId},profile_id.eq.${user.id})`)
        .maybeSingle();

      if (!conv) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert([{ user_id: user.id, profile_id: profileId }])
          .select()
          .single();
        conv = newConv;
      }

      if (conv) {
        setConversationId(conv.id);

        // 2. Load Messages for this Conversation
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
      alert('Failed to send message: ' + (error?.message || 'Error'));
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white p-6">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-md text-sm ${m.sender_id === user?.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-xl p-3 text-sm"
        />
        <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl">
          Send
        </button>
      </form>
    </div>
  );
}
