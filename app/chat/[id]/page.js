'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function getClientUuid() {
  if (typeof window === 'undefined') return 'a0000000-0000-0000-0000-000000000001';
  let id = localStorage.getItem('frumence_client_uuid');
  if (!id) {
    id = 'a' + crypto.randomUUID().slice(1);
    localStorage.setItem('frumence_client_uuid', id);
  }
  return id;
}

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id;

  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(20);
  const [unlockedPhotoIds, setUnlockedPhotoIds] = useState({});
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState(null);

  const clientId = getClientUuid();

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

      const { data: msgData, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && msgData) {
        const filtered = msgData.filter(
          (m) => m.sender_id === profileId || m.receiver_id === profileId || m.profile_id === profileId
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

    const payload = {
      sender_id: clientId,
      receiver_id: profileId,
      profile_id: profileId,
      content: content,
      is_read: false,
      is_operator_reply: false
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([payload])
      .select('*');

    if (error) {
      alert('Error sending message: ' + error.message);
    } else if (data) {
      setMessages((prev) => [...prev, data[0]]);
    }
  };

  const handlePhotoClick = (msg) => {
    // If already unlocked, view the full image immediately
    if (unlockedPhotoIds[msg.id]) {
      const imgUrl = msg.media_url || profile?.resolvedImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600';
      setViewingPhotoUrl(imgUrl);
      return;
    }

    // Otherwise prompt to unlock
    if (credits < 5) {
      alert('You need at least 5 credits to unlock this photo. Please add credits.');
      return;
    }

    if (confirm('Unlock this photo for 5 credits?')) {
      setCredits((prev) => prev - 5);
      setUnlockedPhotoIds((prev) => ({ ...prev, [msg.id]: true }));
      const imgUrl = msg.media_url || profile?.resolvedImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600';
      setViewingPhotoUrl(imgUrl);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={credits} userName="Tumuna Mwabili" />

      <main className="flex-1 flex flex-col justify-between h-screen p-6 overflow-hidden relative">
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
              const isPhoto = m.content?.toLowerCase().includes('photo') || m.media_url;
              const isUnlocked = unlockedPhotoIds[m.id];

              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {isPhoto && !isMe ? (
                    <div
                      onClick={() => handlePhotoClick(m)}
                      className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm cursor-pointer hover:border-blue-500 transition max-w-xs space-y-2"
                    >
                      <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                        {isUnlocked ? (
                          <img
                            src={m.media_url || profile?.resolvedImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'}
                            alt="Unlocked photo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white p-4 text-center space-y-1">
                            <span className="text-3xl">🔒</span>
                            <p className="text-xs font-bold">Protected Photo</p>
                            <p className="text-[10px] text-slate-300">Click to unlock (5 Credits)</p>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 text-center">
                        {isUnlocked ? 'Unlocked Photo (Click to view)' : 'Tap to Open Photo'}
                      </p>
                    </div>
                  ) : (
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs font-semibold ${
                      isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      <p>{m.content}</p>
                      <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
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
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
          >
            Send
          </button>
        </form>

        {/* Full Image Preview Modal */}
        {viewingPhotoUrl && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-4 max-w-md w-full shadow-2xl space-y-4 text-center">
              <div className="relative h-96 rounded-2xl overflow-hidden bg-slate-100">
                <img src={viewingPhotoUrl} alt="Full preview" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setViewingPhotoUrl(null)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
              >
                Close Photo
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
