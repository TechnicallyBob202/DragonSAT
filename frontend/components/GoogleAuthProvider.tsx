'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleConfig {
  googleClientId: string | null;
}

const GoogleConfigContext = createContext<GoogleConfig>({ googleClientId: null });

export function useGoogleConfig() {
  return useContext(GoogleConfigContext);
}

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  // Use build-time env var immediately if available (backwards-compatible),
  // then fetch the runtime value from the server in case the image was built without it.
  const [googleClientId, setGoogleClientId] = useState<string | null>(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null
  );

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.googleClientId) setGoogleClientId(data.googleClientId);
      })
      .catch(() => {});
  }, []);

  return (
    <GoogleConfigContext.Provider value={{ googleClientId }}>
      {/* Always render the provider so useGoogleLogin hooks never throw
          "must be within GoogleOAuthProvider". Individual components guard
          their own buttons by checking googleClientId from useGoogleConfig(). */}
      <GoogleOAuthProvider clientId={googleClientId ?? ''}>
        {children}
      </GoogleOAuthProvider>
    </GoogleConfigContext.Provider>
  );
}
