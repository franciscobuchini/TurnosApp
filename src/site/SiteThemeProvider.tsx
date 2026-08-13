/*
  src/site/SiteThemeProvider.tsx
  Aplica los tokens de apariencia del SiteConfig (colores, radio, tipografía)
  como variables CSS en el wrapper del sitio. Queda aislado del tema claro/
  oscuro del panel admin (Theme.css / useTheme): el sitio público tiene su
  propia paleta, elegida por el dueño del negocio en Personalización.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import type { SiteConfig } from '@/database/types';
import { getSiteCssVars } from './design/cssVars';

interface SiteThemeProviderProps {
  config: Pick<SiteConfig, 'theme' | 'primaryColor' | 'headingColor' | 'borderRadius' | 'headingFont' | 'bodyFont'>;
  className?: string;
  children: ReactNode;
}

const SITE_THEME_CLASS = 'bg-(--site-bg) text-(--site-text)';

export default function SiteThemeProvider({ config, className, children }: SiteThemeProviderProps) {
  return (
    <div
      data-site-theme={config.theme}
      className={twMerge(SITE_THEME_CLASS, className)}
      style={getSiteCssVars(config)}
    >
      {children}
    </div>
  );
}
