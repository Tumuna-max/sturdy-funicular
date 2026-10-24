'use client';

import ClientSidebar from '@/components/ClientSidebar';

export default function FAQPage() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <ClientSidebar credits={20} userName="Tumuna Mwabili" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-3xl">
        <h1 className="text-2xl font-black text-slate-800">Frequently Asked Questions</h1>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">How do credits work?</h3>
            <p className="text-slate-500 mt-1">Credits allow you to send real-time chat messages and letters to verified host profiles.</p>
          </div>
          <div className="border-t pt-3">
            <h3 className="font-extrabold text-slate-800 text-sm">Are host profiles verified?</h3>
            <p className="text-slate-500 mt-1">Yes, all host profiles are reviewed and managed via the platform control center.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
