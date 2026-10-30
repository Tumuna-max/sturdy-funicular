'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientSidebar from '@/components/ClientSidebar';

export default function TopUpPage() {
  const router = useRouter();
  const [credits, setCredits] = useState(20);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('user_credits');
    if (saved) setCredits(Number(saved));
  }, []);

  const handleAddCredits = (amount) => {
    const newTotal = credits + amount;
    setCredits(newTotal);
    localStorage.setItem('user_credits', String(newTotal));
    setSuccessMsg(`Successfully added ${amount} credits! New balance: ${newTotal} credits.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={credits} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition cursor-pointer w-fit"
        >
          <span>←</span> Back
        </button>

        <h1 className="text-2xl font-black text-slate-800">Add Credits</h1>

        {successMsg && (
          <div className="bg-emerald-500 text-white font-bold text-xs p-4 rounded-2xl shadow-md">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center space-y-4">
            <span className="text-3xl">🪙</span>
            <h3 className="font-extrabold text-sm">Starter Pack</h3>
            <p className="text-lg font-black text-blue-600">50 Credits</p>
            <button
              onClick={() => handleAddCredits(50)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Buy 50 Credits
            </button>
          </div>

          <div className="bg-white border border-blue-500 p-6 rounded-3xl shadow-md text-center space-y-4 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">
              Popular
            </span>
            <span className="text-3xl">🪙</span>
            <h3 className="font-extrabold text-sm">Value Pack</h3>
            <p className="text-lg font-black text-blue-600">150 Credits</p>
            <button
              onClick={() => handleAddCredits(150)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Buy 150 Credits
            </button>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center space-y-4">
            <span className="text-3xl">🪙</span>
            <h3 className="font-extrabold text-sm">Pro Pack</h3>
            <p className="text-lg font-black text-blue-600">500 Credits</p>
            <button
              onClick={() => handleAddCredits(500)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Buy 500 Credits
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
