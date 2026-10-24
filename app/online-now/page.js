'use client';

import ClientSidebar from '@/components/ClientSidebar';

export default function OnlineNowPage() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-800">Online Now</h1>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-2">
          <p className="text-xs text-slate-500 font-semibold">Active host members currently online will display live here.</p>
        </div>
      </main>
    </div>
  );
}
