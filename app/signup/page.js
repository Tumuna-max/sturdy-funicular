'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = (e) => {
    e.preventDefault();
    setLoading(true);

    localStorage.setItem('user_name', name);
    localStorage.setItem('user_email', email);
    localStorage.setItem('frumence_client_uuid', 'client_' + crypto.randomUUID());
    localStorage.setItem('user_credits', '20'); // Free 20 welcome credits

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
          <h1 className="text-xl font-black text-slate-900">Create Your Frumence Date Account</h1>
          <p className="text-xs text-slate-500">Sign up now to get 20 free welcome credits!</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tumuna Mwabili"
              className="w-full border p-3 rounded-xl text-xs outline-none bg-slate-50 font-semibold focus:border-blue-600"
              required
            />
          </div>

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
            {loading ? 'Creating Account...' : 'Sign Up & Get 20 Credits'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} className="text-blue-600 font-bold hover:underline cursor-pointer">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
