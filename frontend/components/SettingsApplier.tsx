'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '../hooks/useSettingsStore';

const FONT_SIZES = { small: '14px', medium: '16px', large: '18px' };

export function SettingsApplier() {
  const { fontSize, theme } = useSettingsStore();
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Resolve 'system' to the OS preference, and track changes
  useEffect(() => {
    if (theme !== 'system') {
      setEffectiveTheme(theme);
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setEffectiveTheme(mq.matches ? 'dark' : 'light');
    const handler = (e: MediaQueryListEvent) =>
      setEffectiveTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Apply/remove the 'dark' class on <html>
  useEffect(() => {
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [effectiveTheme]);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', FONT_SIZES[fontSize]);
  }, [fontSize]);

  return null;
}
