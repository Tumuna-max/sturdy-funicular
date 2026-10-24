'use client';

import ClientSidebar from '@/components/ClientSidebar';

export default function PurchaseHistoryPage() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-800">Credits & Purchase History</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-80">Current Balance</span>
            <div className="text-4xl font-black">20 Credits</div>
            <p className="text-xs opacity-90">Use credits to start chats, send direct letters, and unlock special media.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 col-span-2">
            <h2 className="font-extrabold text-slate-800 text-base">Select Credit Package</h2>
            <div className="grid grid-cols-3 gap-3">
              <button className="border-2 border-blue-600 bg-blue-50 p-4 rounded-2xl text-center hover:bg-blue-100 transition">
                <div className="font-black text-blue-700 text-lg">20 Credits</div>
                <div className="text-xs font-bold text-slate-500 mt-1">$9.99</div>
              </button>
              <button className="border border-slate-200 p-4 rounded-2xl text-center hover:border-blue-600 hover:bg-slate-50 transition">
                <div className="font-black text-slate-800 text-lg">50 Credits</div>
                <div className="text-xs font-bold text-slate-500 mt-1">$19.99</div>
              </button>
              <button className="border border-slate-200 p-4 rounded-2xl text-center hover:border-blue-600 hover:bg-slate-50 transition">
                <div className="font-black text-slate-800 text-lg">150 Credits</div>
                <div className="text-xs font-bold text-slate-500 mt-1">$49.99</div>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-800 text-base">Transaction History</h2>
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            No past transactions found.
          </div>
        </div>
      </main>
    </div>
  );
}
