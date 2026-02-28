import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { SettingsApplier } from '@/components/SettingsApplier';
import { GoogleAuthProvider } from '@/components/GoogleAuthProvider';

export const metadata: Metadata = {
  title: 'DragonSAT - Study. Sharpen. Soar.',
  description: 'Comprehensive SAT practice with Study, Quiz, and Test modes',
  icons: {
    apple: '/apple-touch-icon.png',
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <SettingsApplier />
        <GoogleAuthProvider>
          {children}
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
