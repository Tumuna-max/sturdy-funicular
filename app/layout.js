'use client';

import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body className="bg-slate-50">
        <div className="flex min-h-screen">
          {/* Only render default client sidebar if NOT on admin */}
          {!isAdminRoute && (
            <aside className="w-64 border-r bg-white p-4">
              {/* Your default client nav items (All chats, Active Chats, etc.) */}
            </aside>
          )}

          {/* Main Page Content */}
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
