import Navbar from '../components/Navbar';
import './globals.css';

export const metadata = {
  title: 'AI Companion Dashboard',
  description: 'Chat, interact, and manage your credit balance seamlessly.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased"><Navbar/>{children}</body>
    </html>
  );
}
