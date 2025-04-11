import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AidX - Healthcare Platform',
  description: 'A modern healthcare platform for doctors and patients',
  icons: {
    icon: '/aidx-logo.png',
    apple: '/aidx-logo.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/aidx-logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
} 