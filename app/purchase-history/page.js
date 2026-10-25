'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientSidebar from '@/components/ClientSidebar';

export default function PurchaseHistoryPage() {
  const router = useRouter();
  const [credits, setCredits] = useState(20);

  const packages = [
    { id: 1, name: 'Basic Pack', credits: 20, price: '$5.00' },
    { id: 2, name: 'Popular Pack', credits: 50, price: '$10.00' },
    { id: 3, name: 'Pro Pack', credits: 120, price: '$20.00' },
  ];

  const handlePurchase = (item) => {
    setCredits((prev) => prev + item.credits);
    alert(`Successfully purchased ${item.name}! Added ${item.credits} credits.`);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={credits} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition cursor-pointer w-fit"
        >
          <span>←</span> Back
        </button>

        <h1 className="text-2xl font-black text-slate-800">Credits & Purchase History</h1>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-lg flex justify-between items-center">
          <div>
            <p className="text-xs uppercase font-extrabold text-blue-200 tracking-wider">Current Balance</p>
            <h2 className="text-4xl font-black mt-1">{credits} Credits</h2>
          </div>
          <span className="text-5xl">🪙</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800">Buy Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">{pkg.name}</h3>
                  <p className="text-2xl font-black text-blue-600 mt-2">+{pkg.credits} Credits</p>
                </div>
                <button
                  onClick={() => handlePurchase(pkg)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
                >
                  Buy for {pkg.price}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
