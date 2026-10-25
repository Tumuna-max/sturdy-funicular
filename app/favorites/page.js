'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientSidebar from '@/components/ClientSidebar';

export default function FavoritesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition cursor-pointer w-fit"
        >
          <span>←</span> Back
        </button>

        <h1 className="text-2xl font-black text-slate-800">Favorite Profiles</h1>

        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <span className="text-5xl">⭐</span>
          <h2 className="font-extrabold text-slate-800 text-lg">No Favorites Yet</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Save your favorite host profiles to easily access them here.
          </p>
        </div>
      </main>
    </div>
  );
}
