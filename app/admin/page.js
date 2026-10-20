'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Worker Form State
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [workerLoading, setWorkerLoading] = useState(false);

  // Host Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profileAge, setProfileAge] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfiles();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'FrumenceAdmin2026!') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Master Password');
    }
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setProfiles(data);
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setWorkerLoading(true);

    try {
      const cleanEmail = workerEmail.includes('@') 
        ? workerEmail 
        : `${workerEmail.trim().toLowerCase()}@frumencedate.internal`;

      const response = await fetch('/api/admin/create-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail, 
          password: workerPassword,
          role: 'worker',
          operator_slots: 20 
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create worker');

      alert(`Worker successfully created!\nEmail: ${cleanEmail}`);
      setWorkerEmail('');
      setWorkerPassword('');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setWorkerLoading(false);
    }
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const { error } = await supabase.from('profiles').insert([
        { name: profileName, age: parseInt(profileAge), image_url: profileImage, online: true }
      ]);

      if (error) throw error;

      alert('Host Profile added successfully!');
      setProfileName('');
      setProfileAge('');
      setProfileImage('');
      fetchProfiles();
    } catch (err) {
      alert('Error adding profile: ' + err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 text-center">🔐 Admin Gateway</h2>
          <p className="text-xs text-slate-500 text-center">Enter master admin password to continue</p>
          <input
            type="password"
            placeholder="Master Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-3 text-sm"
            required
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
            Authenticate Admin Console
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">⚙️ Admin Control Panel</h1>
        <button onClick={() => setIsAuthenticated(false)} className="text-sm text-rose-600 font-semibold border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50">
          Lock Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-800">👩‍💻 Create Operator Account</h2>
          <form onSubmit={handleCreateWorker} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Worker Username / Email</label>
              <input 
                type="text" 
                value={workerEmail} 
                onChange={(e) => setWorkerEmail(e.target.value)}
                placeholder="e.g. operator1"
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
              <input 
                type="password" 
                value={workerPassword} 
                onChange={(e) => setWorkerPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              />
            </div>
            <button type="submit" disabled={workerLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg">
              {workerLoading ? 'Creating...' : 'Create Worker Account'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-800">🌹 Add Dating Profile (Host)</h2>
          <form onSubmit={handleAddProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Profile Name</label>
              <input 
                type="text" 
                value={profileName} 
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Jessica S."
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Age</label>
                <input 
                  type="number" 
                  value={profileAge} 
                  onChange={(e) => setProfileAge(e.target.value)}
                  placeholder="24"
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Image URL</label>
                <input 
                  type="url" 
                  value={profileImage} 
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>
            <button type="submit" disabled={profileLoading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-lg">
              {profileLoading ? 'Adding...' : 'Add Host Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
