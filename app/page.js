'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
    <main className="min-h-[85vh] bg-gray-950 text-white p-6 font-sans">
      <div className="max-w-2xl mx-auto flex flex-col h-[75vh]">
        <h1 className="text-2xl font-bold mb-4 text-center">AI Companion Chat</h1>

        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-y-auto mb-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="text-gray-500 text-center my-auto">
              Send a message to start chatting!
            </p>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl max-w-[80%] text-sm ${
                msg.sender === 'user'
                  ? 'ml-auto bg-indigo-600 text-white'
                  : 'mr-auto bg-gray-800 text-gray-200'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <p className="text-gray-400 text-xs italic">AI is typing...</p>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white outline-none focus:border-indigo-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-sm transition disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
