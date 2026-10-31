'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Save session locally for client
    localStorage.setItem('user_email', email);
    localStorage.setItem('frumence_client_uuid', 'client_' + crypto.randomUUID());
    localStorage.setItem('user_credits', '20'); // Starting credits

    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 800);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-800 items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-4xl">🌸</span>
          <h1 className="text-xl font-black text-slate-900">Welcome Back to Frumence Date</h1>
          <p className="text-xs text-slate-500">Log in to continue chatting with verified hosts</p>
        </div>

        {error && <div className="bg-rose-50 text-rose-600 text-xs font-bold p-3 rounded-xl">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border p-3 rounded-xl text-xs outline-none bg-slate-50 font-semibold focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border p-3 rounded-xl text-xs outline-none bg-slate-50 font-semibold focus:border-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 rounded-xl transition cursor-pointer shadow-md"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <button onClick={() => router.push('/signup')} className="text-blue-600 font-bold hover:underline cursor-pointer">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
