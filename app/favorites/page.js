'use client';

import ClientSidebar from '@/components/ClientSidebar';

export default function FavoritesPage() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-800">Favorite Profiles</h1>

        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <span className="text-5xl">⭐</span>
          <h2 className="font-extrabold text-slate-800 text-lg">No Favorites Added</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the star icon in a lady's profile details to save her here for quick access.
          </p>
        </div>
      </main>
    </div>
  );
}
