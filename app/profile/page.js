'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientSidebar from '@/components/ClientSidebar';

function getClientUuid() {
  if (typeof window === 'undefined') return 'a0000000-0000-0000-0000-000000000001';
  let id = localStorage.getItem('frumence_client_uuid');
  if (!id) {
    id = 'a' + crypto.randomUUID().slice(1);
    localStorage.setItem('frumence_client_uuid', id);
  }
  return id;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Tumuna Mwabili');
  const [email, setEmail] = useState('frumencemwabili332@gmail.com');
  const [age, setAge] = useState('22');
  const [location, setLocation] = useState('Mombasa, Kenya');
  const [bio, setBio] = useState('Web developer & travel vlogger exploring the East African coast.');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');
  const [credits, setCredits] = useState(20);
  const [saved, setSaved] = useState(false);
  const clientId = getClientUuid();

  useEffect(() => {
    const savedName = localStorage.getItem('user_name');
    const savedEmail = localStorage.getItem('user_email');
    const savedAge = localStorage.getItem('user_age');
    const savedLoc = localStorage.getItem('user_location');
    const savedBio = localStorage.getItem('user_bio');
    const savedPhoto = localStorage.getItem('user_photo');
    const savedCredits = localStorage.getItem('user_credits');

    if (savedName) setUserName(savedName);
    if (savedEmail) setEmail(savedEmail);
    if (savedAge) setAge(savedAge);
    if (savedLoc) setLocation(savedLoc);
    if (savedBio) setBio(savedBio);
    if (savedPhoto) setPhotoUrl(savedPhoto);
    if (savedCredits) setCredits(Number(savedCredits));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('user_name', userName);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_age', age);
    localStorage.setItem('user_location', location);
    localStorage.setItem('user_bio', bio);
    localStorage.setItem('user_photo', photoUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      alert('Logged out successfully.');
      router.push('/');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('WARNING: This will permanently delete your account and clear all local data. Proceed?')) {
      localStorage.clear();
      alert('Account deleted.');
      router.push('/');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={credits} userName={userName} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition cursor-pointer w-fit"
        >
          <span>←</span> Back
        </button>

        <h1 className="text-2xl font-black text-slate-800">My Dating Profile Settings</h1>

        {saved && (
          <div className="bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-md">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm max-w-2xl space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <img src={photoUrl} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border shadow-sm" />
            <div>
              <h2 className="font-extrabold text-sm">{userName}, {age}</h2>
              <p className="text-[10px] text-slate-400">Client UUID: {clientId.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Profile Photo URL</label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="Paste image URL..."
              className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">About Me / Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
              placeholder="Write a short bio about yourself..."
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-md"
            >
              Save Profile Changes
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer border border-slate-200"
            >
              Log Out
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer border border-rose-200"
            >
              Delete Account
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
