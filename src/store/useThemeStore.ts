import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/types';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Apply theme to document on load (before React renders)
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme-storage');
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      const theme = parsed.state?.theme || 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    } catch (e) {
      document.documentElement.classList.add('light');
    }
  } else {
    document.documentElement.classList.add('light');
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // Update document class for Tailwind
          if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(newTheme);
          }
          return { theme: newTheme };
        }),

      setTheme: (theme) =>
        set(() => {
          // Update document class for Tailwind
          if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
          }
          return { theme };
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
