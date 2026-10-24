import './globals.css';

export const metadata = {
  title: 'Frumence Date',
  description: 'Dating Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
