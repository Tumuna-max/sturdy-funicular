'use client';

import ClientSidebar from '@/components/ClientSidebar';

export default function SearchPage() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-800">Advanced Search</h1>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-2xl">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Age Range</label>
            <div className="flex items-center gap-3">
              <input type="number" defaultValue={18} className="w-full border p-3 rounded-xl text-xs font-bold bg-slate-50" />
              <span>to</span>
              <input type="number" defaultValue={45} className="w-full border p-3 rounded-xl text-xs font-bold bg-slate-50" />
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow transition">
            Search Matches
          </button>
        </div>
      </main>
    </div>
  );
}
