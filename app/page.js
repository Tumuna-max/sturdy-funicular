'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to chat.');
      return;
    }

    const userText = inputMessage;
    setInputMessage('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, message: userText }),
      });

      const data = await res.json();

      if (res.status === 402) {
        alert(data.message || 'You are out of credits! Redirecting to top-up page...');
        window.location.href = '/topup';
        return;
      }

      if (!res.ok) {
        alert(data.error || 'Failed to send message.');
        return;
      }

      if (data.reply) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '85vh', backgroundColor: '#030712', color: '#ffffff', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '75vh' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
          AI Companion Chat
        </h1>

        <div style={{ flex: 1, backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.length === 0 && (
            <p style={{ color: '#64748b', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
              Send a message to start chatting!
            </p>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'user' ? '#4f46e5' : '#1e293b',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '8px',
                maxWidth: '80%',
              }}
            >
              {msg.text}
            </div>
          ))}
          {loading && <p style={{ color: '#94a3b8', fontSize: '14px', italic: 'true' }}>AI is typing...</p>}
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            style={{ flex: 1, padding: '12px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#ffffff', outline: 'none' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px 20px', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
