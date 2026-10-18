'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id;

  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchProfileAndMessages = async () => {
      // Get Profile details
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (profileData) setProfile(profileData);

      // Fetch message history for this chat
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .eq('profile_id', profileId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (msgData) setMessages(msgData);
      }
    };

    if (profileId) fetchProfileAndMessages();
  }, [profileId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to chat with profiles.');
      router.push('/login');
      return;
    }

    const textToSend = inputMessage;
    setInputMessage('');
    setSending(true);

    // Call your backend route to check credits, deduct 1 credit, and save message
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, profileId, message: textToSend }),
      });

      const data = await res.json();

      if (res.status === 402) {
        alert('You are out of credits! Redirecting to top-up.');
        router.push('/topup');
        return;
      }

      if (!res.ok) {
        alert(data.error || 'Failed to send message.');
        return;
      }

      // Add user message locally
      setMessages((prev) => [
        ...prev,
        { sender: 'client', message: textToSend, created_at: new Date() }
      ]);
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col">
      {/* Chat Header */}
      <div className="bg-[#111827] border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white text-sm">
            ← Back
          </button>
          {profile && (
            <div className="flex items-center gap-3">
              <img 
                src={profile.avatar_url} 
                alt={profile.name} 
                className="w-10 h-10 rounded-full object-cover border border-pink-500/50"
              />
              <div>
                <h2 className="font-bold text-sm">{profile.name}</h2>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active now
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="text-center my-auto text-gray-500 text-sm">
            Send your first message to start talking with {profile?.name || 'this profile'}. (Costs 1 Credit)
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                msg.sender === 'client' 
                  ? 'ml-auto bg-gradient-to-r from-pink-600 to-indigo-600 text-white rounded-br-sm' 
                  : 'mr-auto bg-[#1f2937] text-gray-200 rounded-bl-sm border border-gray-700/50'
              }`}
            >
              {msg.message}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Bar */}
      <div className="bg-[#111827] border-t border-gray-800 p-4 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-90 font-semibold text-sm rounded-xl transition disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
