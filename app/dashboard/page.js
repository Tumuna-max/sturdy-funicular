'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (data) {
          setFullName(data.full_name || '');
          setAge(data.age || '');
          setLocation(data.location || '');
          setHobbies(data.hobbies || '');
          setBio(data.bio || '');
        }
      }
    }
    loadUserData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      age: age ? parseInt(age) : null,
      location: location,
      hobbies: hobbies,
      bio: bio
    });

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      alert('Profile updated successfully!');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm mt-6 border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">My Profile Settings</h1>
      <p className="text-xs text-slate-500 mb-6">Update your personal details, age, and bio</p>

      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              placeholder="25"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Location / Country</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              placeholder="e.g. Mombasa, Kenya"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Hobbies & Interests</label>
            <input
              type="text"
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              placeholder="e.g. Travel, Movies"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">About Myself / Bio</label>
          <textarea
            rows="4"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
