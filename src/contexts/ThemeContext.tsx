import { createContext, useContext, useEffect, useCallback, ReactNode, useRef } from 'react';
import useReportStore from '../store';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDarkMode = useReportStore((state) => state.settings.theme.darkMode);
  const updateSettings = useReportStore((state) => state.updateSettings);
  const hasSyncedPreference = useRef(false);

  useEffect(() => {
    if (hasSyncedPreference.current) {
      return;
    }

    hasSyncedPreference.current = true;
    const stored = localStorage.getItem('theme');
    const preferred = stored !== null ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (preferred !== isDarkMode) {
      void updateSettings({ theme: { darkMode: preferred } });
    }
  }, [isDarkMode, updateSettings]);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = useCallback(async () => {
    await updateSettings({ theme: { darkMode: !isDarkMode } });
  }, [isDarkMode, updateSettings]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
