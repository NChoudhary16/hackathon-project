'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'stockflow_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Apply theme to document element
  const applyTheme = (targetTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    let effectiveTheme: 'light' | 'dark' = 'light';

    if (targetTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = systemDark ? 'dark' : 'light';
    } else {
      effectiveTheme = targetTheme;
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }

    setResolvedTheme(effectiveTheme);
  };

  // Initialize theme from localStorage on client mount
  useEffect(() => {
    setMounted(true);
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      const initialTheme: Theme = storedTheme && ['light', 'dark', 'system'].includes(storedTheme)
        ? storedTheme
        : 'light';

      setThemeState(initialTheme);
      applyTheme(initialTheme);
    } catch {
      applyTheme('light');
    }
  }, []);

  // Listen to system preference changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // storage unavailable or private browsing
    }
  };

  const toggleTheme = () => {
    const nextTheme: 'light' | 'dark' = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: mounted ? resolvedTheme : 'dark',
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
