'use client';

import { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) return;

    // Create unique session for this specific device
    const newUuid = 'client_' + crypto.randomUUID();
    localStorage.setItem('frumence_client_uuid', newUuid);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_name', isSignUp ? name : email.split('@')[0]);
    if (isSignUp) {
      localStorage.setItem('user_credits', '20'); // Welcome bonus credits
    } else if (!localStorage.getItem('user_credits')) {
      localStorage.setItem('user_credits', '20');
    }

    if (onSuccess) onSuccess();
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-sm p-1"
        >
          ✕
        </button>

        <div className="text-center space-y-1 pt-2">
          <span className="text-3xl">🌸</span>
          <h2 className="text-lg font-black text-slate-800">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500">
            {isSignUp ? 'Sign up to chat, send letters, and meet hosts!' : 'Log in to continue chatting'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none bg-slate-50 font-semibold focus:border-blue-600"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none bg-slate-50 font-semibold focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none bg-slate-50 font-semibold focus:border-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-md"
          >
            {isSignUp ? 'Sign Up & Get 20 Free Credits' : 'Log In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              {isSignUp ? 'Log in' : 'Create account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
