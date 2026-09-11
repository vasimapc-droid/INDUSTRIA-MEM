import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem('im_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('im_theme', theme);
    console.log('[Theme] Applied:', theme, '| html class:', root.className);
  }, [theme]);

  const setTheme = (t) => {
    console.log('[Theme] Setting:', t);
    setThemeState(t);
  };

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    console.log('[Theme] Toggle:', theme, '->', next);
    setThemeState(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    console.warn('[Theme] useTheme called outside ThemeProvider');
    return { theme: 'light', setTheme: () => {}, toggle: () => {} };
  }
  return ctx;
};