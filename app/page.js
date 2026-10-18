'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (amount, credits) => {
    setLoading(true);
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, credits }),
      });

      const data = await res.json();

      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        alert(data.error || 'Failed to create payment invoice. Please try again.');
      }
    } catch (err) {
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            AI Companion Dashboard
          </h1>
          <p className="mt-3 text-slate-400">
            Chat, interact, and manage your credit balance seamlessly.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Current Balance
          </h2>
          <div className="mt-4 flex items-baseline justify-center gap-2">
            <span className="text-5xl font-extrabold text-white">50</span>
            <span className="text-lg font-medium text-slate-400">Credits</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Top Up Credits (USDT TRC-20)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handlePayment(5, 50)}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md"
            >
              {loading ? 'Processing...' : '50 Credits ($5)'}
            </button>
            <button
              onClick={() => handlePayment(10, 120)}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 border border-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md"
            >
              {loading ? 'Processing...' : '120 Credits ($10)'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
