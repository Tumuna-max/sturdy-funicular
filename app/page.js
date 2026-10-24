'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r bg-white p-6 flex flex-col justify-between shrink-0 min-h-screen">
        <div className="space-y-6">
          <div className="flex items-center gap-2 font-extrabold text-blue-600 text-lg">
            <span>🌹</span> Frumence Date
          </div>

          <nav className="space-y-2 text-sm font-semibold text-slate-600">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100 text-slate-900">
              💬 All chats
            </Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition">
              ⚡ Active Chats
            </Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition">
              💳 Purchase History
            </Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition">
              👤 My Profile & Details
            </Link>
          </nav>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          🛡️ Policy
        </div>
      </aside>

      {/* Main Grid Content Area */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Search Bar & Filters */}
        <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-2xl border shadow-sm">
          <input
            type="text"
            placeholder="Search ID or name"
            className="w-full text-sm outline-none px-2 text-slate-700"
          />
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600 shrink-0">
            <label className="flex items-center gap-1 cursor-pointer">
              <span>ONLINE</span>
              <input type="checkbox" defaultChecked className="accent-blue-600" />
            </label>
            <button className="flex items-center gap-1 border px-3 py-1.5 rounded-xl hover:bg-slate-50 transition">
              ⚙️ Search filter
            </button>
          </div>
        </div>

        {/* Profile Grid content here */}
      </main>
    </div>
  );
}
