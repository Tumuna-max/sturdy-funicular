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
  const [unlockModalPhoto, setUnlockModalPhoto] = useState(null);

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

  const handleUnlockPhoto = (msg) => {
    if (credits < 5) {
      alert('You need at least 5 credits to unlock this photo. Please add credits.');
      return;
    }
    setUnlockModalPhoto(msg);
  };

  const confirmUnlock = () => {
    setCredits((prev) => prev - 5);
    setUnlockModalPhoto(null);
    alert('Photo unlocked successfully!');
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
              const isPhoto = m.content?.toLowerCase().includes('photo');

              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {isPhoto && !isMe ? (
                    <div
                      onClick={() => handleUnlockPhoto(m)}
                      className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm cursor-pointer hover:bg-amber-100 transition flex items-center gap-3"
                    >
                      <span className="text-2xl">📸</span>
                      <div>
                        <p className="text-xs font-extrabold text-amber-900">Protected Photo Received</p>
                        <p className="text-[10px] text-amber-700 mt-0.5">Click to unlock for 5 credits</p>
                      </div>
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

        {/* Send Input Bar - Fully Editable */}
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

        {/* Unlock Photo Modal */}
        {unlockModalPhoto && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <span className="text-5xl">🎁</span>
              <h3 className="text-lg font-black text-slate-800">Unlock Photo</h3>
              <p className="text-xs text-slate-500">
                Would you like to spend <strong className="text-blue-600">5 credits</strong> to open and view this photo?
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setUnlockModalPhoto(null)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUnlock}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Unlock (5 Cr)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
