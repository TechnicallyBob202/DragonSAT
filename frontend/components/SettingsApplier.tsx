'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '../hooks/useSettingsStore';

const FONT_SIZES = { small: '14px', medium: '16px', large: '18px' };

export function SettingsApplier() {
  const { fontSize, theme } = useSettingsStore();

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', FONT_SIZES[fontSize]);
  }, [fontSize]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return null;
}
