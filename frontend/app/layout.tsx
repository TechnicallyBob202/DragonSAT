import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { SettingsApplier } from '@/components/SettingsApplier';
import { GoogleAuthProvider } from '@/components/GoogleAuthProvider';

export const metadata: Metadata = {
  title: 'HapaSAT - SAT Prep Made Easy',
  description: 'Comprehensive SAT practice with Study, Quiz, and Test modes',
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
      <body className="bg-gray-50">
        <SettingsApplier />
        <GoogleAuthProvider>
          {children}
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
