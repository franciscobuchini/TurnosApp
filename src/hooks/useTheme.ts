/*
  src/hooks/useTheme.ts
  Tema claro/oscuro de la app. Se guarda en localStorage y se aplica como
  data-theme en <html> — src/styles/Theme.css tiene los valores de color
  para "light" (por defecto usa los de "dark", sin necesidad de atributo).
*/

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

function readStoredTheme(): Theme {
  return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
}
