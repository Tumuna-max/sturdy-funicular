'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientSidebar({ credits = 20, userName = "Tumuna Mwabili" }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'All chats', href: '/', icon: '💬' },
    { label: 'Unread', href: '/unread', icon: '🏳️', badge: 'New' },
    { label: 'Favorites', href: '/favorites', icon: '⭐' },
    { label: 'Your likes', href: '/your-likes', icon: '♡' },
    { label: 'Letters', href: '/letters', icon: '✉️' },
    { label: 'Online now', href: '/online-now', icon: '📷' },
    { label: 'Search', href: '/search', icon: '🔍' },
    { label: 'Like', href: '/like', icon: '💙' },
    { label: 'FAQ', href: '/faq', icon: '❓' },
    { label: 'Tutorial', href: '/tutorial', icon: '📖' },
  ];

  const getInitials = (name) => {
    if (!name) return 'TU';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between shrink-0 h-screen sticky top-0 text-slate-700">
      <div className="space-y-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 font-black text-blue-600 text-xl px-2">
          <span>🌸</span> Frumence Date
        </div>

        {/* Client Avatar Header */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-700 text-white font-black text-base flex items-center justify-center shrink-0">
            {getInitials(userName)}
          </div>
          <div className="space-y-1 w-full">
            <Link
              href="/profile"
              className="block w-full text-center text-xs font-bold text-blue-600 border border-blue-200 rounded-lg py-1 hover:bg-blue-50 transition"
            >
              👤 My profile
            </Link>
            <Link
              href="/profile?tab=credits"
              className="block w-full text-center text-xs font-bold text-slate-600 border border-slate-200 rounded-lg py-1 hover:bg-slate-100 transition"
            >
              🪙 Credits
            </Link>
          </div>
        </div>

        {/* Add Credits Button */}
        <Link
          href="/purchase-history"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition"
        >
          <span>ⓒ</span> Add credits
        </Link>

        {/* Full Nav List */}
        <nav className="space-y-1 text-xs font-bold text-slate-600">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                  isActive
                    ? 'bg-blue-600 text-white font-black shadow-sm'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer p-2 rounded-xl hover:bg-slate-50">
          <span>🛡️</span> Policy
        </div>
      </div>
    </aside>
  );
}
