'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (data) {
          setName(data.name || '');
          setAge(data.age || '');
          setLocation(data.location || '');
          setHobbies(data.hobbies || '');
          setBio(data.bio || '');
        }
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from('users').update({
      name,
      age: parseInt(age) || null,
      location,
      hobbies,
      bio,
    }).eq('id', user.id);

    setSaving(false);
    if (error) alert('Error updating profile: ' + error.message);
    else alert('Profile updated successfully!');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">My Profile Settings</h1>
          <p className="text-xs text-slate-400">Update your personal details, age, location, and hobbies.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold border border-blue-200">
          {user?.email}
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tumuna Frumence"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 25"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Location / Country</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mombasa, Kenya"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Hobbies & Interests</label>
            <input
              type="text"
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
              placeholder="e.g. Travel, Football, Coding"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">About Myself / Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="3"
            placeholder="Write a brief introduction about yourself..."
            className="w-full border border-slate-300 rounded-xl p-4 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md"
        >
          {saving ? 'Saving...' : 'Save Profile Details'}
        </button>
      </form>
    </div>
  );
}
