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
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

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
