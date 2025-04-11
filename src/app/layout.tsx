import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AidX - Healthcare Platform',
  description: 'Your trusted healthcare companion',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-black hover:bg-gray-800',
          footerActionLink: 'text-black hover:text-gray-800',
          card: 'rounded-lg',
          socialButtonsIconButton: 'rounded-lg border-2 border-black',
          socialButtonsBlockButton: 'rounded-lg border-2 border-black',
          formFieldInput: 'rounded-lg border-2 border-gray-200',
          dividerLine: 'bg-gray-200',
          dividerText: 'text-gray-600',
        },
      }}
    >
      <html lang="en">
        <head>
          <link rel="icon" href="/logo.png" />
        </head>
        <body className={inter.className}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
} 