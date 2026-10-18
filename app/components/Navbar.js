'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar() {
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    async function fetchUserCredits() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (data) {
        setCredits(data.credits);
      }
    }

    fetchUserCredits();
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800 text-white">
      <Link href="/" className="font-bold text-lg tracking-wide">
        AI Companion
      </Link>

      <div className="flex items-center space-x-4">
        {credits !== null && (
          <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
            <span className="text-yellow-400 font-semibold">⚡ {credits}</span>
            <span className="text-xs text-gray-400">Credits</span>
          </div>
        )}

        <Link
          href="/topup"
          className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-full text-sm font-medium transition"
        >
          Top Up
        </Link>
      </div>
    </nav>
  );
}
