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
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [unlockedMedia, setUnlockedMedia] = useState({}); // Track unlocked msg IDs
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function initChat() {
      if (!profileId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch user credits
      const { data: userData } = await supabase.from('users').select('credits').eq('id', user.id).single();
      if (userData) setCredits(userData.credits ?? 50);

      // Fetch host profile
      const { data: host } = await supabase.from('profiles').select('*').eq('id', profileId).maybeSingle();
      if (host) setHostProfile(host);

      // Load existing messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profileId}),and(sender_id.eq.${profileId},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},profile_id.eq.${profileId})`)
        .order('created_at', { ascending: true });

      if (msgs) setMessages(msgs);
    }

    initChat();
  }, [profileId]);

  // Send Message Logic (2 credits text, 10 credits photo, 15 credits video)
  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !file) || !user || !profileId) return;

    let isVideo = file && file.type.startsWith('video');
    let isImage = file && file.type.startsWith('image');
    let cost = isVideo ? 15 : (isImage ? 10 : 2);

    if (credits < cost) {
      alert(`Insufficient credits! You need ${cost} credits to send this ${isVideo ? 'Video' : isImage ? 'Photo' : 'Text'}.`);
      return;
    }

    setSending(true);
    let uploadedMediaUrl = null;
    let mediaType = isVideo ? 'video' : isImage ? 'image' : null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);

      if (uploadErr) {
        alert('File upload failed: ' + uploadErr.message);
        setSending(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('chat-media').getPublicUrl(fileName);
      uploadedMediaUrl = publicUrlData.publicUrl;
    }

    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          receiver_id: profileId,
          profile_id: profileId,
          content: text || (mediaType === 'video' ? '📹 Sent a video' : '📷 Sent a photo'),
          media_url: uploadedMediaUrl,
          media_type: mediaType
        }
      ])
      .select('*');

    if (!error && newMsg && newMsg.length > 0) {
      const newCreditBalance = credits - cost;
      await supabase.from('users').update({ credits: newCreditBalance }).eq('id', user.id);
      setCredits(newCreditBalance);

      setMessages((prev) => [...prev, newMsg[0]]);
      setText('');
      setFile(null);
    } else {
      alert('Send failed: ' + (error?.message || 'Database error'));
    }
    setSending(false);
  };

  // Unlock Media Logic (5 credits photo, 20 credits video)
  const handleUnlockMedia = async (msgId, mediaType) => {
    let unlockCost = mediaType === 'video' ? 20 : 5;

    if (credits < unlockCost) {
      alert(`Insufficient credits! You need ${unlockCost} credits to unlock this ${mediaType}.`);
      return;
    }

    const newCreditBalance = credits - unlockCost;
    await supabase.from('users').update({ credits: newCreditBalance }).eq('id', user.id);
    setCredits(newCreditBalance);

    setUnlockedMedia((prev) => ({ ...prev, [msgId]: true }));
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white p-6">
      {hostProfile && (
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={hostProfile.image_url || hostProfile.avatar_url || hostProfile.image || 'https://via.placeholder.com/150'} 
              alt={hostProfile.name} 
              className="w-12 h-12 rounded-full object-cover shrink-0 border" 
            />
            <div>
              <h2 className="font-bold text-lg text-slate-800">{hostProfile.name}, {hostProfile.age}</h2>
              <p className="text-xs text-emerald-600 font-semibold">Online now</p>
            </div>
          </div>

          <div className="bg-blue-50 text-blue-700 font-bold text-xs px-4 py-2 rounded-xl border border-blue-200">
            Credits Remaining: {credits}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-slate-50 rounded-xl border">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
            Start a conversation with {hostProfile?.name || 'this host'}
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === user?.id;
            const isUnlocked = isMe || unlockedMedia[m.id];

            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-md text-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-white border text-slate-800 shadow-sm'}`}>
                  {m.media_url && (
                    <div className="relative mb-2 rounded-xl overflow-hidden">
                      {isUnlocked ? (
                        m.media_type === 'image' ? (
                          <img src={m.media_url} alt="Media" className="max-h-60 w-full object-cover rounded-xl" />
                        ) : (
                          <video src={m.media_url} controls className="max-h-60 w-full object-cover rounded-xl" />
                        )
                      ) : (
                        <div className="relative border bg-slate-200 h-48 w-full flex flex-col items-center justify-center rounded-xl overflow-hidden p-4">
                          <div className="absolute inset-0 bg-slate-800/40 backdrop-blur-md"></div>
                          <div className="relative z-10 text-center text-white space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider">
                              🔒 Locked {m.media_type === 'video' ? 'Video' : 'Photo'}
                            </p>
                            <button
                              onClick={() => handleUnlockMedia(m.id, m.media_type)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow transition"
                            >
                              Unlock for {m.media_type === 'video' ? '20' : '5'} Credits
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {m.content && <p>{m.content}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="space-y-2">
        {file && (
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl text-xs font-semibold text-slate-700">
            <span>📎 Attached: {file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="text-rose-600 font-bold hover:underline">Remove</button>
          </div>
        )}

        <div className="flex gap-2">
          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 p-3 rounded-xl flex items-center justify-center text-slate-600 font-bold text-sm">
            📷 / 📹
            <input 
              type="file" 
              accept="image/*,video/*" 
              onChange={(e) => setFile(e.target.files[0])} 
              className="hidden" 
            />
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Text: 2cr | Send Photo: 10cr | Send Video: 15cr"
            className="flex-1 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition shadow"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
