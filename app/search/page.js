'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ClientSidebar from '@/components/ClientSidebar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function SearchPage() {
  const router = useRouter();
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(70);
  const [nameQuery, setNameQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .gte('age', Number(minAge))
      .lte('age', Number(maxAge));

    if (!error && data) {
      const filtered = data.filter((p) =>
        p.name?.toLowerCase().includes(nameQuery.toLowerCase())
      );
      setResults(
        filtered.map((p) => ({
          ...p,
          resolvedImg: p.image_url || p.avatar_url || p.image || p.photo_url || ''
        }))
      );
    }
    setSearched(true);
    setLoading(false);
  };

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

        <h1 className="text-2xl font-black text-slate-800">Advanced Search</h1>

        <form onSubmit={handleSearch} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm max-w-xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Min Age</label>
              <input
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Max Age</label>
              <input
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Name / Keyword</label>
            <input
              type="text"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-md"
          >
            {loading ? 'Searching...' : 'Search Matches'}
          </button>
        </form>

        {searched && (
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-extrabold text-slate-800">Search Results ({results.length})</h2>
            {results.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-400">
                No profiles matched your search criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.map((lady) => (
                  <div
                    key={lady.id}
                    onClick={() => router.push(`/chat/${lady.id}`)}
                    className="bg-white border border-slate-200 hover:border-blue-500 p-3 rounded-2xl shadow-sm cursor-pointer space-y-2 flex items-center gap-3"
                  >
                    <img src={lady.resolvedImg} alt={lady.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-extrabold text-sm">{lady.name}, {lady.age}</h3>
                      <p className="text-[10px] text-slate-400">{lady.location || 'Mombasa, Kenya'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
