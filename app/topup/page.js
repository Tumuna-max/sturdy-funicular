'use client';

import { useState } from 'react';

const PACKAGES = [
  { id: 'starter', price: 5, credits: 50, popular: false },
  { id: 'pro', price: 10, credits: 110, popular: true, bonus: '+10 Bonus' },
  { id: 'ultra', price: 20, credits: 250, popular: false, bonus: '+50 Bonus' },
];

export default function TopUpPage() {
  const [loading, setLoading] = useState(null);

  const handleBuy = async (pkg) => {
    setLoading(pkg.id);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceAmount: pkg.price,
          orderId: `CR_${pkg.id.toUpperCase()}_${Date.now()}`,
        }),
      });

      const data = await res.json();

      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      alert('Error initiating checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Top Up Credits</h1>
        <p className="text-gray-400 mb-12">Select a credit package to continue messaging.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-gray-900 border ${
                pkg.popular ? 'border-indigo-500 shadow-indigo-500/20 shadow-lg' : 'border-gray-800'
              } rounded-2xl p-6 flex flex-col justify-between`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div>
                <h2 className="text-2xl font-bold mb-2">{pkg.credits} Credits</h2>
                {pkg.bonus && <p className="text-sm text-indigo-400 font-medium mb-4">{pkg.bonus}</p>}
                <div className="text-4xl font-extrabold my-4">${pkg.price}</div>
              </div>

              <button
                onClick={() => handleBuy(pkg)}
                disabled={loading === pkg.id}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition disabled:opacity-50"
              >
                {loading === pkg.id ? 'Redirecting...' : 'Buy with Crypto'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
