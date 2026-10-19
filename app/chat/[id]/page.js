'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChatPage() {
  const params = useParams();
  const profileId = params.id;
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch user credits
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
      if (userData) setCredits(userData.credits);

      // Fetch profile details
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      if (profileData) setProfile(profileData);

      // Fetch message history
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: true });
      if (msgData) setMessages(msgData);

      setLoading(false);
    }

    if (profileId) initChat();
  }, [profileId, router]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !profile) return;

    if (credits <= 0) {
      alert('You have 0 credits left! Please top up to continue chatting.');
      router.push('/topup');
      return;
    }

    // Insert message
    const { error: msgError } = await supabase.from('messages').insert([
      {
        user_id: user.id,
        profile_id: profile.id,
        sender: 'client',
        message: newMessage,
      },
    ]);

    if (msgError) {
      alert('Failed to send message.');
      return;
    }

    // Deduct 1 credit
    const newCredits = credits - 1;
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', user.id);

    if (!updateError) {
      setCredits(newCredits);
      setMessages([...messages, { sender: 'client', message: newMessage, id: Date.now() }]);
      setNewMessage('');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading chat session...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] m-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <img
            src={profile?.avatar_url}
            alt={profile?.name}
            className="w-12 h-12 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h2 className="font-bold text-slate-900">{profile?.name}, {profile?.age}</h2>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online now
            </p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-xs font-bold text-blue-700">
          Credits Left: {credits}
        </div>
      </div>

      {/* Message History Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-12">
            Say hello to {profile?.name}! Each message costs 2 credit.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id || Math.random()}
              className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-2xl text-sm ${
                  m.sender === 'client'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                }`}
              >
                {m.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input Form */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Type a message to ${profile?.name} (2 credit)...`}
          className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}
