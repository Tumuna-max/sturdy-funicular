'use client';

import { useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

export default function PurchaseHistoryPage() {
  const [credits, setCredits] = useState(20);
  const [loadingPackage, setLoadingPackage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Your exact credit pricing options
  const packages = [
    { credits: 20, price: 2.00 },
    { credits: 55, price: 5.00 },
    { credits: 110, price: 10.00 },
    { credits: 265, price: 20.00 },
  ];

  const handleCheckout = async (pkg) => {
    setLoadingPackage(pkg.credits);
    setErrorMsg('');

    try {
      const res = await fetch('/api/nowpayments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: pkg.price,
          credits: pkg.credits,
          userId: '1404449847',
        }),
      });

      const data = await res.json();

      if (data.invoice_url) {
        // Redirects directly to the NOWPayments checkout screen
        window.location.href = data.invoice_url;
      } else {
        setErrorMsg(data.error || 'Could not connect to NOWPayments.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoadingPackage(null);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={credits} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-800">Credits & Purchase History</h1>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-80">Current Balance</span>
            <div className="text-4xl font-black">{credits} Credits</div>
            <p className="text-xs opacity-90">Use credits to start chats and send direct letters.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 col-span-2">
            <h2 className="font-extrabold text-slate-800 text-base">Select Credit Package</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.credits}
                  className="border border-slate-200 p-4 rounded-2xl text-center flex flex-col justify-between hover:border-blue-600 hover:bg-blue-50/50 transition space-y-3"
                >
                  <div>
                    <div className="font-black text-slate-800 text-base">{pkg.credits} Credits</div>
                    <div className="text-xs font-bold text-blue-600 mt-1">${pkg.price.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => handleCheckout(pkg)}
                    disabled={loadingPackage === pkg.credits}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 rounded-xl transition shadow disabled:opacity-50 cursor-pointer"
                  >
                    {loadingPackage === pkg.credits ? 'Loading...' : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
