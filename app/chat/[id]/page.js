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
  const [unlockedMediaIds, setUnlockedMediaIds] = useState({});
  const [viewingMedia, setViewingMedia] = useState(null); // { url, type }

  const clientId = getClientUuid();

  useEffect(() => {
    const savedCredits = localStorage.getItem('user_credits');
    if (savedCredits) setCredits(Number(savedCredits));

    // Load permanently unlocked media IDs from localStorage
    const savedUnlocked = localStorage.getItem('unlocked_media');
    if (savedUnlocked) {
      try {
        setUnlockedMediaIds(JSON.parse(savedUnlocked));
      } catch (e) {}
    }

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
          (m) =>
            (m.sender_id === clientId && (m.receiver_id === profileId || m.profile_id === profileId)) ||
            (m.sender_id === profileId && (m.receiver_id === clientId || m.profile_id === profileId)) ||
            m.profile_id === profileId
        );
        setMessages(filtered);
      }
      setLoading(false);
    }

    loadChatData();

    const channel = supabase
      .channel('chat-room-sync')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.profile_id === profileId || newMsg.sender_id === profileId || newMsg.receiver_id === clientId) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, clientId]);

  const deductCredits = (amount) => {
    const newTotal = credits - amount;
    setCredits(newTotal);
    localStorage.setItem('user_credits', String(newTotal));
  };

  const handleSendMessage = async (e, customContent = null, mediaUrl = null, mediaType = 'text') => {
    if (e) e.preventDefault();
    const content = customContent || inputText;
    if (!content.trim() && !mediaUrl) return;

    // Pricing rules: Text = 2 Cr, Photo = 10 Cr, Video = 20 Cr
    const cost = mediaType === 'video' ? 20 : mediaUrl ? 10 : 2;

    if (credits < cost) {
      alert(`You need at least ${cost} credits to send this. Please top up.`);
      return;
    }

    deductCredits(cost);
    if (!customContent) setInputText('');

    const payload = {
      sender_id: clientId,
      receiver_id: profileId,
      profile_id: profileId,
      content: content,
      media_url: mediaUrl || null,
      media_type: mediaType,
      is_read: false,
      is_operator_reply: false
    };

    const { data, error } = await supabase.from('messages').insert([payload]).select('*');
    if (!error && data) {
      setMessages((prev) => [...prev, data[0]]);
      // Auto-unlock media sent by client permanently
      if (mediaUrl) {
        const updated = { ...unlockedMediaIds, [data[0].id]: true };
        setUnlockedMediaIds(updated);
        localStorage.setItem('unlocked_media', JSON.stringify(updated));
      }
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const label = type === 'video' ? '🎬 Sent a video' : '📸 Sent a photo';
        handleSendMessage(null, label, base64String, type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenMedia = (msg) => {
    const isVideo = msg.media_type === 'video' || msg.content?.toLowerCase().includes('video');
    const mediaUrl = msg.media_url || profile?.resolvedImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600';

    // If already unlocked permanently, view right away
    if (unlockedMediaIds[msg.id] || msg.sender_id === clientId) {
      setViewingMedia({ url: mediaUrl, type: isVideo ? 'video' : 'photo' });
      return;
    }

    const cost = isVideo ? 15 : 5; // Open photo = 5 Cr, Open video = 15 Cr

    if (credits < cost) {
      alert(`You need ${cost} credits to open this ${isVideo ? 'video' : 'photo'}. Please top up.`);
      return;
    }

    if (confirm(`Open this ${isVideo ? 'video' : 'photo'} for ${cost} credits? It will remain unlocked forever.`)) {
      deductCredits(cost);
      const updated = { ...unlockedMediaIds, [msg.id]: true };
      setUnlockedMediaIds(updated);
      localStorage.setItem('unlocked_media', JSON.stringify(updated));
      setViewingMedia({ url: mediaUrl, type: isVideo ? 'video' : 'photo' });
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
              const isMe = m.sender_id === clientId && !m.is_operator_reply;
              const isMedia = m.media_url || m.media_type === 'photo' || m.media_type === 'video' || m.content?.toLowerCase().includes('photo') || m.content?.toLowerCase().includes('video');
              const isVideo = m.media_type === 'video' || m.content?.toLowerCase().includes('video');
              const isUnlocked = unlockedMediaIds[m.id] || isMe;
              const cost = isVideo ? 15 : 5;

              let cleanContent = m.content || '';
              if (cleanContent.startsWith('[LETTER')) {
                cleanContent = cleanContent.replace(/\[LETTER.*?\]\n\n/, '');
              }

              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {isMedia ? (
                    <div
                      onClick={() => handleOpenMedia(m)}
                      className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm cursor-pointer hover:border-blue-500 transition max-w-xs space-y-2"
                    >
                      <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                        {isUnlocked ? (
                          isVideo ? (
                            <div className="w-full h-full bg-black flex items-center justify-center text-white font-bold text-xs relative">
                              <video src={m.media_url} className="w-full h-full object-cover" />
                              <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-2xl">▶️</span>
                            </div>
                          ) : (
                            <img
                              src={m.media_url || profile?.resolvedImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'}
                              alt="Unlocked media"
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <>
                            {/* Blurry Background */}
                            <div
                              className="absolute inset-0 bg-cover bg-center filter blur-md opacity-50 scale-110"
                              style={{ backgroundImage: `url(${m.media_url || profile?.resolvedImg || ''})` }}
                            />
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center space-y-1">
                              <span className="text-3xl">{isVideo ? '🎬' : '🔒'}</span>
                              <p className="text-xs font-bold">Protected {isVideo ? 'Video' : 'Photo'}</p>
                              <p className="text-[10px] text-slate-300">Tap to open ({cost} Credits)</p>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 text-center">
                        {isUnlocked ? (isVideo ? 'Play Video (Unlocked)' : 'View Photo (Unlocked)') : `Open for ${cost} Credits`}
                      </p>
                    </div>
                  ) : (
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs font-semibold ${
                      isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap">{cleanContent}</p>
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

        {/* Clean WhatsApp-style Input Bar (No credit clutter) */}
        <form onSubmit={handleSendMessage} className="flex gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm items-center">
          <label className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer text-slate-600" title="Attach Photo">
            📎📷
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="hidden" />
          </label>
          <label className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer text-slate-600" title="Attach Video">
            📎🎬
            <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
          </label>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-xs outline-none px-2 bg-transparent text-slate-700"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow shrink-0"
          >
            Send
          </button>
        </form>

        {/* Media Preview Modal (Plays Videos & Views Photos) */}
        {viewingMedia && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-4 max-w-lg w-full shadow-2xl space-y-4 text-center">
              <div className="relative h-96 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                {viewingMedia.type === 'video' ? (
                  <video src={viewingMedia.url} controls autoPlay className="w-full h-full object-contain" />
                ) : (
                  <img src={viewingMedia.url} alt="Full preview" className="w-full h-full object-contain" />
                )}
              </div>
              <button
                onClick={() => setViewingMedia(null)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
