'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between text-white">
      <Link href="/" className="font-bold text-lg text-pink-500">
        Live Chat
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
          Dashboard
        </Link>
        <Link href="/login" className="bg-pink-600 hover:bg-pink-500 font-semibold px-4 py-2 rounded-xl transition">
          Log In / Sign Up
        </Link>
      </div>
    </nav>
  );
}
