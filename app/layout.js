import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Live Dating Chat',
  description: 'Connect with live hosts',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
