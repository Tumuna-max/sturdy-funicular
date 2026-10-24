'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('');

  // Form states
  const [workerUsername, setWorkerUsername] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');

  const [hostName, setHostName] = useState('');
  const [hostAge, setHostAge] = useState('');
  const [hostImageUrl, setHostImageUrl] = useState('');

  // Data states
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Host Profiles
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(
        data.map((p) => ({
          ...p,
          resolvedImg: p.image_url || p.avatar_url || p.image || p.photo_url || ''
        }))
      );
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      fetchProfiles();
    }
  }, [isAdminUnlocked]);

  // Create Worker Account
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!workerUsername || !workerPassword) return;

    setLoading(true);
    const formattedEmail = workerUsername.includes('@')
      ? workerUsername
      : `${workerUsername.trim().toLowerCase()}@frumencedate.internal`;

    const { error } = await supabase.auth.signUp({
      email: formattedEmail,
      password: workerPassword
    });

    if (error) {
      alert('Error creating worker: ' + error.message);
    } else {
      alert(`Worker "${workerUsername}" created successfully!`);
      setWorkerUsername('');
      setWorkerPassword('');
    }
    setLoading(false);
  };

  // Add Host Profile
  const handleAddHost = async (e) => {
    e.preventDefault();
    if (!hostName || !hostAge) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          name: hostName.trim(),
          age: parseInt(hostAge),
          image_url: hostImageUrl.trim() || null
        }
      ])
      .select();

    if (error) {
      alert('Error adding host profile: ' + error.message);
    } else {
      alert(`Profile for "${hostName}" added successfully!`);
      setHostName('');
      setHostAge('');
      setHostImageUrl('');
      fetchProfiles();
    }
    setLoading(false);
  };

  // Delete Host Profile
  const handleDeleteProfile = async (id, name) => {
    if (!confirm(`Are you sure you want to delete profile "${name}"?`)) return;

    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) {
      alert('Error deleting profile: ' + error.message);
    } else {
      alert(`Profile "${name}" deleted.`);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleUnlockAdmin = (e) => {
    e.preventDefault();
    if (adminPin === '2026' || adminPin === '1234') {
      setIsAdminUnlocked(true);
    } else {
      alert('Invalid Admin Passcode');
    }
  };

  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <form onSubmit={handleUnlockAdmin} className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full space-y-4">
          <div className="text-center">
            <span className="text-4xl">🔐</span>
            <h2 className="text-2xl font-black text-slate-800 mt-2">Admin Portal</h2>
            <p className="text-xs text-slate-500">Enter passcode to manage platform profiles</p>
          </div>
          <input
            type="password"
            value={adminPin}
            onChange={(e) => setAdminPin(e.target.value)}
            placeholder="Passcode"
            className="w-full border p-3 rounded-xl text-center text-lg font-bold tracking-widest bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow transition">
            Unlock Console
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      {/* Clean & Professional Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
            <span className="text-2xl">🌹</span>
            <div>
              <h1 className="font-extrabold text-base tracking-wide text-white">Frumence Date</h1>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">
                Admin Control
              </span>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow">
              <span>⚙️</span> Control Center
            </div>
          </nav>
        </div>

        <button
          onClick={() => setIsAdminUnlocked(false)}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 text-slate-400 font-bold text-xs py-3 rounded-xl border border-slate-700/50 transition"
        >
          🔒 Lock Console
        </button>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <header className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Platform Management</h2>
            <p className="text-xs text-slate-500">Manage operator accounts and host profiles</p>
          </div>
        </header>

        {/* Action Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Operator Account */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <span className="text-xl">👩‍💻</span>
              <h3 className="font-bold text-slate-800 text-base">Create Worker Account</h3>
            </div>
            <form onSubmit={handleCreateWorker} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Worker Username</label>
                <input
                  type="text"
                  value={workerUsername}
                  onChange={(e) => setWorkerUsername(e.target.value)}
                  placeholder="e.g. operator1"
                  className="w-full border p-3 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Password</label>
                <input
                  type="password"
                  value={workerPassword}
                  onChange={(e) => setWorkerPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border p-3 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-sm transition shadow"
              >
                Create Worker Account
              </button>
            </form>
          </div>

          {/* Add Dating Profile (Host) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <span className="text-xl">🌹</span>
              <h3 className="font-bold text-slate-800 text-base">Add Dating Profile (Host)</h3>
            </div>
            <form onSubmit={handleAddHost} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Profile Name</label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Jessica S."
                  className="w-full border p-3 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Age</label>
                  <input
                    type="number"
                    value={hostAge}
                    onChange={(e) => setHostAge(e.target.value)}
                    placeholder="24"
                    className="w-full border p-3 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={hostImageUrl}
                    onChange={(e) => setHostImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border p-3 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-xl text-sm transition shadow"
              >
                Add Host Profile
              </button>
            </form>
          </div>
        </div>

        {/* Existing Host Profiles Grid */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">💃</span>
              <h3 className="font-extrabold text-slate-800 text-lg">Active Host Profiles ({profiles.length})</h3>
            </div>
            <button
              onClick={fetchProfiles}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              🔄 Refresh Grid
            </button>
          </div>

          {profiles.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm italic">
              No profiles found in the database. Add one above!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-2xl overflow-hidden bg-slate-50 shadow-sm hover:shadow transition flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-slate-200">
                    <img
                      src={p.resolvedImg || 'https://via.placeholder.com/300x300?text=No+Photo'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/70 text-white font-bold text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      Age {p.age}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 text-base">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">ID: {p.id}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteProfile(p.id, p.name)}
                      className="w-full bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-transparent font-bold text-xs py-2 rounded-xl transition"
                    >
                      🗑️ Delete Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
