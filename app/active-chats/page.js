'use client';

import Link from 'next/link';

export default function ActiveChatsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/" className="bg-white border p-2.5 rounded-xl hover:bg-slate-100 transition font-bold text-sm shadow-sm flex items-center gap-1">
          ← Back
        </Link>
        <h1 className="text-2xl font-black text-slate-800">Active Chats</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl border shadow-sm text-center space-y-3">
        <span className="text-4xl">⚡</span>
        <h2 className="font-bold text-slate-700 text-base">No active chats yet</h2>
        <p className="text-xs text-slate-400">Start a conversation from the main browse page to see your chats here.</p>
      </div>
    </div>
  );
}
