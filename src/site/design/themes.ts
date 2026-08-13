/*
  src/site/design/themes.ts
  Paletas de fondo/superficie/texto prediseñadas para el sitio público. El
  color de acento (botones, CTAs) es independiente — ver colors.ts — así
  que un theme acá sólo define superficies, nunca "primary". Agregar un
  theme nuevo es sumar un objeto a SITE_THEMES — nada más del sitio cambia.
*/

import type { SiteThemeId } from '@/database/types';

export type SiteThemeDefinition = {
  id: SiteThemeId;
  label: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
};

export const SITE_THEMES: SiteThemeDefinition[] = [
  {
    id: 'theme-2',
    label: 'Oscuro',
    colors: {
      background: '#0a0a0a',
      surface: '#161616',
      text: '#fafafa',
      textMuted: '#a3a3a3',
      border: '#272727',
    },
  },
  {
    id: 'theme-1',
    label: 'Claro',
    colors: {
      background: '#f8f8f6',
      surface: '#ffffff',
      text: '#17171a',
      textMuted: '#6b6b70',
      border: '#e7e7e3',
    },
  },
  {
    id: 'theme-3',
    label: 'Cálido',
    colors: {
      background: '#fbf3ea',
      surface: '#fffaf3',
      text: '#3a2a1e',
      textMuted: '#8a7360',
      border: '#ecdfce',
    },
  },
];

export const SITE_THEME_BY_ID = Object.fromEntries(
  SITE_THEMES.map((theme) => [theme.id, theme]),
) as Record<SiteThemeId, SiteThemeDefinition>;
