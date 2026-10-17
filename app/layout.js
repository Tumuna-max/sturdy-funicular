export const metadata = {
  title: 'AI Companion Dashboard',
  description: 'Manage your credits and chat',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a' }}>
        {children}
      </body>
    </html>
  );
}
