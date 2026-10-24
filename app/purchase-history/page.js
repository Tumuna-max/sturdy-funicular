'use client';

import { useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

export default function PurchaseHistoryPage() {
  const [credits, setCredits] = useState(20);
  const [successMsg, setSuccessMsg] = useState('');

  const handleBuyCredits = (amount, cost) => {
    setCredits((prev) => prev + amount);
    setSuccessMsg(`Successfully added ${amount} credits! ($${cost})`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={credits} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-800">Credits & Purchase History</h1>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-xs font-bold animate-in fade-in">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-80">Current Balance</span>
            <div className="text-4xl font-black">{credits} Credits</div>
            <p className="text-xs opacity-90">Use credits to start chats and send direct letters.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 col-span-2">
            <h2 className="font-extrabold text-slate-800 text-base">Select Credit Package</h2>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => handleBuyCredits(20, 2.99)}
                className="border-2 border-blue-600 bg-blue-50 p-4 rounded-2xl text-center hover:bg-blue-100 transition cursor-pointer"
              >
                <div className="font-black text-blue-700 text-lg">20 Credits</div>
                <div className="text-xs font-bold text-slate-500 mt-1">$2.99</div>
              </button>
              <button 
                onClick={() => handleBuyCredits(50, 5.99)}
                className="border border-slate-200 p-4 rounded-2xl text-center hover:border-blue-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="font-black text-slate-800 text-lg">50 Credits</div>
                <div className="text-xs font-bold text-slate-500 mt-1">$5.99</div>
              </button>
              <button 
                onClick={() => handleBuyCredits(100, 10.99)}
                className="border border-slate-200 p-4 rounded-2xl text-center hover:border-blue-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="font-black text-slate-800 text-lg">100 Credits</div>
                <div className="text-xs font-bold text-slate-500 mt-1">$10.99</div>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-800 text-base">Transaction Log</h2>
          <div className="text-xs text-slate-500 space-y-2">
            <div className="flex justify-between border-b pb-2 font-medium">
              <span>Initial Account Grant</span>
              <span className="text-emerald-600 font-bold">+20 Credits</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
