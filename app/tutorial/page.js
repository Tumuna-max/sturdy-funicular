'use client';

import ClientSidebar from '@/components/ClientSidebar';

export default function TutorialPage() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-3xl">
        <h1 className="text-2xl font-black text-slate-800">Platform Tutorial</h1>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <p className="font-bold text-slate-700">1. Browse active ladies using the main 4-column grid.</p>
          <p className="font-bold text-slate-700">2. Click "👤 Profile" to read full bios, habits, and details.</p>
          <p className="font-bold text-slate-700">3. Purchase credits to start instant messaging.</p>
        </div>
      </main>
    </div>
  );
}
