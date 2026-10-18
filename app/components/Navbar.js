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
    const getUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();
        if (data) setCredits(data.credits);
      }
    };

    getUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setCredits(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="w-full border-b border-gray-800 bg-gray-950 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-extrabold text-white hover:text-pink-500 transition">
        Live Chat
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {credits !== null && (
              <div className="bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg text-sm text-gray-300">
                <span className="font-semibold text-pink-500">{credits}</span> Credits
              </div>
            )}
            <Link
              href="/topup"
              className="bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
            >
              Add Credits
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            Log In / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}
