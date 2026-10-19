'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('profiles');

  // New Profile Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [photosInput, setPhotosInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: profileData } = await supabase.from('profiles').select('*').order('id', { ascending: false });
    if (profileData) setProfiles(profileData);

    const { data: userData } = await supabase.from('users').select('*');
    if (userData) setUsers(userData);
  }

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    const photosArray = photosInput ? photosInput.split(',').map((s) => s.trim()) : [avatarUrl];

    const { error } = await supabase.from('profiles').insert([
      {
        name,
        age: parseInt(age),
        location,
        bio,
        avatar_url: avatarUrl || photosArray[0],
        photos: photosArray,
      },
    ]);

    if (error) {
      alert('Error creating profile: ' + error.message);
    } else {
      alert('Host profile successfully created!');
      setName('');
      setAge('');
      setLocation('');
      setBio('');
      setAvatarUrl('');
      setPhotosInput('');
      fetchData();
    }
  };

  const handleDeleteProfile = async (id) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Frumence Date Admin Console</h1>
          <p className="text-xs text-slate-500">Manage host profiles, review user balances, and system settings.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'profiles' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Host Profiles ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Users & Credits
          </button>
        </div>
      </div>

      {activeTab === 'profiles' ? (
        <div className="space-y-8">
          {/* Add Profile Form */}
          <form onSubmit={handleCreateProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add New Host Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input type="text" placeholder="Full Name (e.g. Jessica M.)" value={name} onChange={(e) => setName(e.target.value)} required className="border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500" />
              <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required className="border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Location (e.g. Mombasa)" value={location} onChange={(e) => setLocation(e.target.value)} required className="border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <textarea placeholder="Bio description..." value={bio} onChange={(e) => setBio(e.target.value)} rows="2" className="w-full border border-slate-300 rounded-xl p-4 text-xs focus:outline-none focus:border-blue-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="url" placeholder="Avatar Main Image URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} required className="border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Extra Photo URLs (comma separated)" value={photosInput} onChange={(e) => setPhotosInput(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition">Create Profile</button>
          </form>

          {/* Profiles Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                <tr>
                  <th className="p-4">Host</th>
                  <th className="p-4">Age / Location</th>
                  <th className="p-4">Bio</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4 flex items-center gap-3 font-semibold text-slate-900">
                      <img src={p.avatar_url} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                      {p.name}
                    </td>
                    <td className="p-4 text-slate-600">{p.age} yrs • {p.location}</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{p.bio}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteProfile(p.id)} className="text-rose-600 hover:text-rose-800 font-bold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
              <tr>
                <th className="p-4">User ID / Email</th>
                <th className="p-4">Credit Balance</th>
                <th className="p-4">Operator Slots (Quota)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-slate-700">{u.id}</td>
                  <td className="p-4 font-bold text-blue-600">{u.credits ?? 0} credits</td>
                  <td className="p-4 font-bold text-emerald-600">{u.operator_slots ?? 20} slots</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
