'use client';

export default function ProfileDetailModal({ profile, onClose }) {
  if (!profile) return null;

  const samplePhotos = [
    profile.resolvedImg || 'https://via.placeholder.com/600x800',
    profile.resolvedImg || 'https://via.placeholder.com/600x800',
    profile.resolvedImg || 'https://via.placeholder.com/600x800',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 my-8 relative animate-in fade-in zoom-in duration-200">
        
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 px-6 bg-slate-50">
          <div className="flex items-center gap-3">
            <button className="border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5">
              ✉️ Write a letter
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition flex items-center gap-1.5">
              💬 Start chatting
            </button>
            <button className="border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5">
              ⭐ Favorites
            </button>
            <button className="border border-slate-300 bg-white hover:bg-slate-100 text-slate-500 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5">
              ⚠️ Complain
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 text-2xl font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative h-96 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={samplePhotos[0]}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-blue-100/90 text-blue-700 font-bold text-[10px] px-2.5 py-1 rounded-full border border-blue-300">
                  I'm online now
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-black text-slate-800">
                  {profile.name}, {profile.age}
                </h1>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  ID: {profile.id || '1020460347'} • 📍 {profile.location || 'Mombasa, Kenya'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-100 transition flex items-center gap-2">
                  👋 Say "Hello"
                </button>
                <button className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow">
                  💙 Like
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={samplePhotos[1]} className="w-full h-full object-cover" alt="Gallery 1" />
                </div>
                <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={samplePhotos[2]} className="w-full h-full object-cover" alt="Gallery 2" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8 text-xs">
            <div className="space-y-6">
              <div>
                <h3 className="font-black text-slate-400 uppercase tracking-wider mb-3">APPEARANCE</h3>
                <ul className="space-y-2 text-slate-600 font-semibold">
                  <li className="flex justify-between border-b border-slate-50 pb-1"><span>Height:</span> <span className="font-bold text-slate-800">165 Cm</span></li>
                  <li className="flex justify-between border-b border-slate-50 pb-1"><span>Body Type:</span> <span className="font-bold text-slate-800">Average</span></li>
                  <li className="flex justify-between border-b border-slate-50 pb-1"><span>Hair Color:</span> <span className="font-bold text-slate-800">Brunette</span></li>
                  <li className="flex justify-between border-b border-slate-50 pb-1"><span>Eyes Color:</span> <span className="font-bold text-slate-800">Amber</span></li>
                </ul>
              </div>

              <div>
                <h3 className="font-black text-slate-400 uppercase tracking-wider mb-3">SOCIAL INFORMATION</h3>
                <ul className="space-y-2 text-slate-600 font-semibold">
                  <li className="flex justify-between border-b border-slate-50 pb-1"><span>Education:</span> <span className="font-bold text-slate-800">Diploma</span></li>
                  <li className="flex justify-between border-b border-slate-50 pb-1"><span>Marital Status:</span> <span className="font-bold text-slate-800">Single</span></li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-black text-slate-400 uppercase tracking-wider mb-2">MY SELF-SUMMARY</h3>
                <p className="text-slate-600 leading-relaxed">
                  {profile.bio || "Creative, ambitious, and energetic. I love digital trends, traveling, and good conversations over coffee."}
                </p>
              </div>

              <div>
                <h3 className="font-black text-slate-400 uppercase tracking-wider mb-2">HOBBY AND HABITS</h3>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Hobby:</strong> Reading, Sightseeing, Music<br/>
                  <strong>Smoking:</strong> Never | <strong>Alcohol:</strong> Socially
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
