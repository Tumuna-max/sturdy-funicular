'use client';

import { useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

export default function MyProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  const [name, setName] = useState('Tumuna Mwabili');
  const [dobMonth, setDobMonth] = useState('Jan');
  const [dobDay, setDobDay] = useState('1');
  const [dobYear, setDobYear] = useState('1981');
  const [country, setCountry] = useState('Kenya');
  const [city, setCity] = useState('Mombasa');
  const [email] = useState('mwabilitumuna@gmail.com');
  const [credits] = useState(20);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <ClientSidebar credits={credits} userName={name} />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
       <import BackButton from '@/components/BackButton';/>
        <div className="flex items-center justify-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 max-w-lg mx-auto shadow-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              activeTab === 'credits'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            🪙 Credits
          </button>
          <button
            onClick={() => setActiveTab('block')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              activeTab === 'block'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            🚫 Block list
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-48 h-48 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-6xl text-slate-300">
                  👤
                </div>
                <button className="flex items-center gap-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition">
                  <span className="text-base">+</span> New avatar
                </button>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">DATE OF BIRTH</label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className="border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-800 bg-slate-50 text-center outline-none"
                    />
                    <input
                      type="text"
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value)}
                      className="border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-800 bg-slate-50 text-center outline-none"
                    />
                    <input
                      type="text"
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value)}
                      className="border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-800 bg-slate-50 text-center outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">COUNTRY</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-800 bg-slate-50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">CITY</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-800 bg-slate-50 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button className="w-full border border-slate-300 text-slate-700 font-bold text-xs py-3 rounded-xl hover:bg-slate-50 transition flex items-center justify-between px-4">
                    <span>Change email / password & other</span>
                    <span>∨</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 flex flex-wrap justify-between items-center text-xs font-semibold text-slate-400 gap-2">
              <div>ID: 1404449847</div>
              <div>Registered email: <span className="text-slate-600">{email}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="bg-blue-50 border border-blue-200 p-8 rounded-3xl max-w-md mx-auto text-center space-y-4 shadow-sm">
            <div className="text-5xl">🪙</div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Your balance</p>
              <h2 className="text-3xl font-black text-blue-700 mt-1">{credits} credits</h2>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow transition">
              Get more credits
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
