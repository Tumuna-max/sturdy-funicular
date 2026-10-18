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
    const fetchUserAndCredits = async () => {
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

    fetchUserAndCredits();
  }, []);

  return (
    <nav className="w-full border-b border-gray-800 bg-gray-950 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-white hover:text-indigo-400 transition">
        AI Companion
      </Link>

      <div className="flex items-center gap-4">
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
      </div>
    </nav>
  );
}
