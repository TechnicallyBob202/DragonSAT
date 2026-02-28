'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleConfig {
  googleClientId: string;
}

const GoogleConfigContext = createContext<GoogleConfig>({ googleClientId: '' });

export function useGoogleConfig() {
  return useContext(GoogleConfigContext);
}

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const [googleClientId, setGoogleClientId] = useState('');

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setGoogleClientId(data.googleClientId ?? ''))
      .catch(() => {}); // Google OAuth simply won't show if config fetch fails
  }, []);

  // Always render the provider so useGoogleLogin hooks never throw "must be within GoogleOAuthProvider".
  // Individual components guard their own buttons by checking googleClientId from useGoogleConfig().
  return (
    <GoogleConfigContext.Provider value={{ googleClientId }}>
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    </GoogleConfigContext.Provider>
  );
}
