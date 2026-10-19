'use client';

import './globals.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('users').select('credits').eq('id', user.id).single();
        if (data) setCredits(data.credits);
      }
    }
    loadUser();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-800 antialiased min-h-screen">
        <div className="flex max-w-[1600px] mx-auto min-h-screen bg-white shadow-xl">
          
          {/* PUBLIC LEFT SIDEBAR */}
          <aside className="w-64 border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 bg-white">
            <div className="space-y-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 text-blue-600 font-extrabold text-xl px-2">
                <span className="text-2xl">🌹</span> Frumence Date
              </Link>

              {/* Profile Card / Auth Status */}
              <div className="bg-slate-50 border
