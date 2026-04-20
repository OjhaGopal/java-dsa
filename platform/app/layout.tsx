import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DSA Platform',
  description: 'Practice DSA problems like LeetCode',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d1117] text-[#c9d1d9] antialiased overflow-hidden h-screen">
        {children}
      </body>
    </html>
  );
}
