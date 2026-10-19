{/* Profile Card / Auth Status */}
<div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
  <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-sm">
    {user ? user.email.substring(0, 2).toUpperCase() : 'GS'}
  </div>
  <div className="flex-1 overflow-hidden">
    <p className="text-xs font-bold text-slate-800 truncate">{user ? user.email : 'Guest Visitor'}</p>
    <div className="flex gap-1 text-xs mt-1">
      {user ? (
        <>
          <Link href="/dashboard" className="border border-slate-300 rounded px-2 py-0.5 font-medium hover:bg-slate-200">
            Profile
          </Link>
          <button onClick={handleLogout} className="border border-rose-300 text-rose-600 rounded px-2 py-0.5 font-medium hover:bg-rose-50">
            Logout
          </button>
        </>
      ) : (
        <Link href="/login" className="border border-blue-600 text-blue-600 font-bold rounded px-3 py-0.5 hover:bg-blue-50">
          Sign In / Join
        </Link>
      )}
    </div>
  </div>
</div>
