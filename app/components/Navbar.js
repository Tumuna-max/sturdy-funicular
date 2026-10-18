'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar() {
  const [credits, setCredits] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check initial user session
    const getUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchCredits(user.id);
      }
    };

    getUserSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchCredits(session.user.id);
      } else {
        setUser(null);
        setCredits(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchCredits = async (userId) => {
    const { data } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();
    if (data) setCredits(data.credits);
  };

  const handleLogin = async () => {
    // Replace with your preferred sign-in logic (e.g., Google or Magic Link)
    const email = prompt('Enter your email to log in / sign up:');
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for the login link!');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="w-full border-b border-gray-800 bg-gray-950 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-white hover:text-indigo-400 transition">
        AI Companion
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {credits !== null && (
              <div className="bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg text-sm text-gray-300">
                <span className="font-semibold text-indigo-400">{credits}</span> Credits
              </div>
            )}
            <Link
              href="/topup"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Top Up
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Log In / Sign Up
          </button>
        )}
      </div>
    </nav>
  );
}
