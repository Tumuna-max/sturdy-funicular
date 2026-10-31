'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function ClientSidebar({ credits = 20, userName = 'Tumuna Mwabili' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState('');
  const [liveCredits, setLiveCredits] = useState(credits);
  const [displayName, setDisplayName] = useState(userName);

  useEffect(() => {
    const savedPhoto = localStorage.getItem('user_photo');
    const savedCredits = localStorage.getItem('user_credits');
    const savedName = localStorage.getItem('user_name');
    const uuid = localStorage.getItem('frumence_client_uuid');

    // If no session exists, redirect to login page
    if (!uuid && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
      return;
    }

    if (savedPhoto) setUserPhoto(savedPhoto);
    if (savedCredits) setLiveCredits(Number(savedCredits));
    if (savedName) setDisplayName(savedName);

    const handleStorage = () => {
      const c = localStorage.getItem('user_credits');
      if (c) setLiveCredits(Number(c));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [pathname, router]);

  const navItems = [
    { label: 'Browse ladies', path: '/', icon: '🌸' },
    { label: 'All chats', path: '/chats', icon: '💬', badge: unreadCount },
    { label: 'Unread', path: '/unread', icon: '🏳️', badge: unreadCount },
    { label: 'Favorites', path: '/favorites', icon: '⭐' },
    { label: 'Your likes', path: '/your-likes', icon: '🤍' },
    { label: 'Letters', path: '/letters', icon: '✉️' },
    { label: 'Online now', path: '/online-now', icon: '📸' },
    { label: 'Search', path: '/search', icon: '🔍' },
    { label: 'My Profile', path: '/profile', icon: '👤' },
    { label: 'FAQ', path: '/faq', icon: '❓' },
    { label: 'Tutorial', path: '/tutorial', icon: '📖' },
  ];

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌸</span>
          <span className="font-black text-sm text-slate-800">Frumence Date</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/topup')}
            className="bg-blue-600 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-sm"
          >
            🪙 {liveCredits} Cr
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-slate-100 hover:bg-slate-200 p-2 rounded-xl text-slate-700 font-bold text-xs"
          >
            {isOpen ? '✕ Close' : '☰ Menu'}
          </button>
        </div>
      </div>

      {isOpen && <div onClick={() => setIsOpen(false)} className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40" />}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-screen overflow-y-auto shrink-0 p-4 space-y-4 transition-transform duration-300 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center justify-between px-2 pt-2 md:pt-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <h1 className="font-black text-base text-slate-800 tracking-tight">Frumence Date</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 font-bold text-xs p-1">✕</button>
        </div>

        {/* User Profile Card */}
        <div
          onClick={() => { router.push('/profile'); setIsOpen(false); }}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition shadow-xs group"
        >
          {userPhoto ? (
            <img src={userPhoto} alt={displayName} className="w-10 h-10 rounded-full object-cover shrink-0 border shadow-sm group-hover:scale-105 transition" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-sm shrink-0 shadow-sm group-hover:scale-105 transition">
              {displayName.charAt(0)}
            </div>
          )}
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-extrabold text-slate-800 truncate group-hover:text-blue-600 transition">{displayName}</p>
            <p className="text-[10px] text-slate-500 font-bold">{liveCredits} Credits available</p>
          </div>
          <span className="text-slate-400 text-xs font-bold">⚙️</span>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => { router.push('/topup'); setIsOpen(false); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            🪙 Add credits
          </button>
        </div>

        <nav className="flex-1 space-y-1 pt-2">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={idx}
                onClick={() => { router.push(item.path); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-blue-600' : 'bg-rose-600 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="md:hidden h-14 shrink-0" />
    </>
  );
}
