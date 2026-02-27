import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

interface SettingsState {
  theme: Theme;
  fontSize: FontSize;
  showTimer: boolean;
  soundEffects: boolean;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setShowTimer: (v: boolean) => void;
  setSoundEffects: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 'medium',
      showTimer: true,
      soundEffects: false,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setShowTimer: (showTimer) => set({ showTimer }),
      setSoundEffects: (soundEffects) => set({ soundEffects }),
    }),
    { name: 'hapasat-settings' }
  )
);
