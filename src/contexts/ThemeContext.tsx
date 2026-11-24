'use client';

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

let currentTheme: Theme | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function readPreferredTheme(): Theme {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getClientTheme(): Theme {
  if (currentTheme) {
    return currentTheme;
  }
  currentTheme = readPreferredTheme();
  return currentTheme;
}

function getServerTheme(): Theme {
  return 'light';
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onMediaChange = () => {
    if (!localStorage.getItem('theme')) {
      currentTheme = media.matches ? 'dark' : 'light';
      emit();
    }
  };
  media.addEventListener('change', onMediaChange);
  return () => {
    listeners.delete(onStoreChange);
    media.removeEventListener('change', onMediaChange);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getClientTheme, getServerTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = getClientTheme() === 'light' ? 'dark' : 'light';
    currentTheme = nextTheme;
    localStorage.setItem('theme', nextTheme);
    emit();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
