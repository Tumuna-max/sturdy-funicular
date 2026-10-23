import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Frumence Date',
  description: 'Dating and Chat Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 min-h-screen">
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <span className="text-2xl">🌹</span>
              <h1 className="font-extrabold text-lg text-blue-600 tracking-tight">Frumence Date</h1>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 text-sm font-medium text-slate-600">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-900 font-semibold transition">
                <span>💬</span> All chats
              </Link>
              <Link href="/active-chats" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-900 font-semibold transition">
                <span>⚡</span> Active Chats
              </Link>
              <Link href="/topup" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-900 font-semibold transition">
                <span>💳</span> Purchase History
              </Link>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-900 font-semibold transition">
                <span>👤</span> My Profile & Details
              </Link>
            </nav>
          </div>

          {/* Footer Link */}
          <div className="pt-4 border-t border-slate-100">
            <Link href="/policy" className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-600 py-2 border rounded-xl bg-slate-50">
              <span>🛡️</span> Policy
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
