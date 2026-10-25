'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id;

  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const clientId = '1404449847';

  useEffect(() => {
    async function loadChatData() {
      if (!supabase || !profileId) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileData) {
        setProfile({
          ...profileData,
          resolvedImg: profileData.image_url || profileData.avatar_url || profileData.image || profileData.photo_url || ''
        });
      }

      // Fetch messages where either sender or receiver matches
      const { data: msgData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${clientId},receiver_id.eq.${clientId},profile_id.eq.${profileId}`)
        .order('created_at', { ascending: true });

      if (!error && msgData) {
        // Filter strictly for conversation with this profile
        const filtered = msgData.filter(
          m => m.sender_id === profileId || m.receiver_id === profileId || m.profile_id === profileId
        );
        setMessages(filtered);
      }
      setLoading(false);
    }

    loadChatData();
  }, [profileId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !supabase) return;

    const content = inputText;
    setInputText('');

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: clientId,
          receiver_id: profileId,
          profile_id: profileId,
          content: content,
          is_read: false,
          is_operator_reply: false
        }
      ])
      .select('*');

    if (error) {
      alert('Error sending message: ' + error.message);
    } else if (data) {
      setMessages((prev) => [...prev, data[0]]);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 flex flex-col justify-between h-screen p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition cursor-pointer w-fit"
            >
              <span>←</span> Back
            </button>
            {profile && (
              <div className="flex items-center gap-3">
                <img src={profile.resolvedImg} alt={profile.name} className="w-10 h-10 rounded-full object-cover border" />
                <div>
                  <h2 className="font-extrabold text-sm">{profile.name}, {profile.age}</h2>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online now
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 my-4">
          {loading ? (
            <div className="text-center text-slate-400 text-xs py-10">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-10 italic">
              No messages yet. Send a greeting to start chatting!
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMe = m.sender_id === clientId;
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3.5 rounded-2xl text-xs font-semibold ${
                    isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}>
                    <p>{m.content}</p>
                    <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Send Input Bar */}
        <form onSubmit={handleSendMessage} className="flex gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 text-xs outline-none px-3 bg-transparent text-slate-700"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer">
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
