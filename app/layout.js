'use client';

import './globals.css';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">
        {isAdminRoute ? (
          // Admin gets full screen without the client sidebar
          children
        ) : (
          // Main Client App Layout
          <div className="flex min-h-screen">
            <main className="flex-1">{children}</main>
          </div>
        )}
      </body>
    </html>
  );
}
