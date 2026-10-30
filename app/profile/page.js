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
  const [gallery, setGallery] = useState([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
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
    const savedGallery = localStorage.getItem('user_gallery');
    const savedCredits = localStorage.getItem('user_credits');

    if (savedName) setUserName(savedName);
    if (savedEmail) setEmail(savedEmail);
    if (savedAge) setAge(savedAge);
    if (savedLoc) setLocation(savedLoc);
    if (savedBio) setBio(savedBio);
    if (savedPhoto) setPhotoUrl(savedPhoto);
    if (savedGallery) setGallery(JSON.parse(savedGallery));
    if (savedCredits) setCredits(Number(savedCredits));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGalleryPhoto = (e) => {
    e.preventDefault();
    if (!newGalleryUrl.trim()) return;
    const updated = [...gallery, newGalleryUrl];
    setGallery(updated);
    setNewGalleryUrl('');
    localStorage.setItem('user_gallery', JSON.stringify(updated));
  };

  const handleRemoveGalleryPhoto = (index) => {
    const updated = gallery.filter((_, i) => i !== index);
    setGallery(updated);
    localStorage.setItem('user_gallery', JSON.stringify(updated));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('user_name', userName);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_age', age);
    localStorage.setItem('user_location', location);
    localStorage.setItem('user_bio', bio);
    localStorage.setItem('user_photo', photoUrl);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload(); // Refresh to update sidebar avatar instantly
    }, 1500);
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

        <h1 className="text-2xl font-black text-slate-800">My Dating Profile & Photos</h1>

        {saved && (
          <div className="bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-md">
            Profile & Avatar updated successfully! Reloading sidebar...
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm max-w-2xl space-y-5">
          {/* Avatar & File Upload Picker */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <img src={photoUrl} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border shadow-sm" />
            <div className="flex-1 space-y-1">
              <h2 className="font-extrabold text-sm">{userName}, {age}</h2>
              <label className="inline-block bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] px-3 py-1.5 rounded-xl cursor-pointer transition border border-blue-200">
                📷 Choose Profile Photo
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
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
            <label className="block text-xs font-bold text-slate-600 mb-1">About Me / Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold bg-slate-50 outline-none focus:border-blue-600"
              placeholder="Write a short bio about yourself..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-md"
          >
            Save Profile Changes
          </button>
        </form>

        {/* Gallery / Posted Photos Section */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm max-w-2xl space-y-4">
          <h2 className="font-black text-sm text-slate-800">My Posted Photos & Gallery</h2>
          <p className="text-xs text-slate-400">Add photos to your profile gallery for visitors to view.</p>

          <form onSubmit={handleAddGalleryPhoto} className="flex gap-2">
            <input
              type="text"
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              placeholder="Paste image URL to add to gallery..."
              className="flex-1 border border-slate-200 p-3 rounded-xl text-xs outline-none bg-slate-50"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer shadow"
            >
              Add Photo
            </button>
          </form>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
            {gallery.map((img, idx) => (
              <div key={idx} className="relative h-28 rounded-2xl overflow-hidden border bg-slate-100 group">
                <img src={img} alt="Gallery item" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryPhoto(idx)}
                  className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-80 hover:opacity-100 transition cursor-pointer shadow"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Account Controls */}
        <div className="max-w-2xl flex gap-3 pb-8">
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition cursor-pointer border border-slate-200"
          >
            Log Out
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs py-3 rounded-xl transition cursor-pointer border border-rose-200"
          >
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
}
