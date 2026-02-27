'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  // Always render the provider so useGoogleLogin hooks never throw "must be within GoogleOAuthProvider".
  // Individual components guard their own buttons with NEXT_PUBLIC_GOOGLE_CLIENT_ID checks.
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
