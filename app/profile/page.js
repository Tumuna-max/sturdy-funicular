'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientSidebar from '@/components/ClientSidebar';

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Tumuna Mwabili');
  const [email, setEmail] = useState('frumence@example.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName={userName} />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition cursor-pointer w-fit"
        >
          <span>←</span> Back
        </button>

        <h1 className="text-2xl font-black text-slate-800">My Profile</h1>

        {saved && (
          <div className="bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-md">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm max-w-xl space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
}
