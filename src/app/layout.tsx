import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ARLook - AI Rental Assistant',
  description: 'AI-powered rental assistant platform for international students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

