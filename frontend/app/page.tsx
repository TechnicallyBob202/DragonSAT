'use client';

import { useEffect, useState } from 'react';
import { SetupLayout } from '@/components/SetupLayout';
import { LoginPage } from '@/components/LoginPage';

export default function Home() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(!!localStorage.getItem('authToken'));
  }, []);

  // Avoid flash of wrong content during hydration
  if (authed === null) return null;

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  return <SetupLayout />;
}
