'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ label = "Back" }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition cursor-pointer w-fit"
    >
      <span>←</span> {label}
    </button>
  );
}
