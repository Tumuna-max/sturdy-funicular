'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function LetterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get('to');

  const [recipient, setRecipient] = useState(null);
  const [subject, setSubject] = useState('');
  const [letterBody, setLetterBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Standardized client UUID
  const clientId = 'a0000000-0000-0000-0000-000000000001';

  useEffect(() => {
    async function fetchRecipient() {
      if (!supabase || !recipientId) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', recipientId)
        .single();

      if (data) {
        setRecipient({
          ...data,
          resolvedImg: data.image_url || data.avatar_url || data.image || data.photo_url || ''
        });
      }
    }

    fetchRecipient();
  }, [recipientId]);

  const handleSendLetter = async (e) => {
    e.preventDefault();
    if (!letterBody.trim() || !supabase || !recipientId) return;

    setSending(true);

    const fullContent = subject ? `[LETTER: ${subject}]\n\n${letterBody}` : `[LETTER]\n\n${letterBody}`;

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: clientId,
        receiver_id: recipientId,
        profile_id: recipientId,
        content: fullContent,
        is_read: false,
        is_operator_reply: false
      }
    ]);

    setSending(false);

    if (error) {
      alert('Error sending letter: ' + error.message);
    } else {
      setSentSuccess(true);
      setSubject('');
      setLetterBody('');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition cursor-pointer w-fit"
        >
          <span>←</span> Back
        </button>

        <h1 className="text-2xl font-black text-slate-800">Letters</h1>

        {recipientId ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-2xl space-y-6">
            {recipient && (
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <img
                  src={recipient.resolvedImg || 'https://via.placeholder.com/150'}
                  alt={recipient.name}
                  className="w-14 h-14 rounded-2xl object-cover border"
                />
                <div>
                  <h2 className="font-extrabold text-slate-800 text-base">Write a Letter to {recipient.name}, {recipient.age}</h2>
                  <p className="text-xs text-slate-400">{recipient.location || 'Mombasa, Kenya'}</p>
                </div>
              </div>
            )}

            {sentSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-3">
                <span className="text-4xl">✉️</span>
                <h3 className="font-extrabold text-lg">Letter Sent Successfully!</h3>
                <p className="text-xs text-emerald-600">Your letter has been sent. You will be notified when she replies.</p>
                <button
                  onClick={() => router.push('/chats')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  View in Conversations
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendLetter} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter letter title..."
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Letter Content</label>
                  <textarea
                    rows={8}
                    value={letterBody}
                    onChange={(e) => setLetterBody(e.target.value)}
                    placeholder="Write your long-form message here..."
                    className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs py-3.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  {sending ? 'Sending Letter...' : '✉️ Send Letter'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <span className="text-5xl">✉️</span>
            <h2 className="font-extrabold text-slate-800 text-lg">Your Letter Inbox is Empty</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click "Letter" on any lady's profile card to write and send her a long-form letter.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LettersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-xs">Loading letters page...</div>}>
      <LetterContent />
    </Suspense>
  );
}
