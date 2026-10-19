'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TopUpPage() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('users').select('credits').eq('id', user.id).single();
        if (data) setCredits(data.credits);
      }
    }
    loadUser();
  }, []);

  const handleAddCredits = async (amount) => {
    if (!user) {
      alert('Please log in first.');
      return;
    }

    const newBalance = credits + amount;
    const { error } = await supabase.from('users').update({ credits: newBalance }).eq('id', user.id);

    if (!error) {
      setCredits(newBalance);
      alert(`Successfully added ${amount} credits to your account!`);
    } else {
      alert('Error updating credits.');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Current Balance Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Balance</h2>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{credits} credits</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">1 message = 1 credit deduction</p>
        </div>
      </div>

      {/* Credit Package Offer Card */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md mx-auto space-y-6">
        <span className="bg-rose-100 text-rose-600 text-xs font-extrabold px-3 py-1 rounded-full">-77% LIMITED TIME OFFER</span>
        <div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">Ultimate Credit Package</h3>
          <p className="text-xs text-slate-400 mt-1">Don't miss out on this special discount bundle</p>
        </div>

        <div className="py-4">
          <p className="text-5xl font-extrabold text-slate-900">35 Credits</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xl font-bold text-rose-600">$2.99</span>
            <span className="text-sm text-slate-400 line-through">$12.99</span>
          </div>
        </div>

        <button
          onClick={() => handleAddCredits(35)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md"
        >
          Get 35 Credits Now
        </button>
      </div>

      {/* Purchase History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Purchase history</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Credit Amount</th>
              <th className="p-3">Method</th>
              <th className="p-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-3 text-slate-500">Today</td>
              <td className="p-3 font-bold text-blue-600">+35 credits</td>
              <td className="p-3 text-slate-500">Secure Checkout</td>
              <td className="p-3 text-right font-bold text-slate-900">$2.99</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
