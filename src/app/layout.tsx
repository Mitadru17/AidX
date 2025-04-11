import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AidX - Healthcare Platform',
  description: 'A modern healthcare platform for doctors and patients',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 