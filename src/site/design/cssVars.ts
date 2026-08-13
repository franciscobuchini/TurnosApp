/*
  src/site/design/cssVars.ts
  Traduce un SiteConfig a variables CSS (--site-*) + fontFamily, listas para
  aplicar como `style` en el div raíz del sitio (ver SiteThemeProvider). Los
  componentes del sitio las consumen con la sintaxis de Tailwind v4 para
  variables arbitrarias: bg-(--site-surface), rounded-(--site-radius), etc.

  La fuente de título (--site-heading-font) es aparte de fontFamily (que fija
  la fuente de texto, heredada por defecto): sólo los elementos con
  SITE_HEADING_FONT_CLASS la usan — ver headingFonts.ts.
*/

import type { CSSProperties } from 'react';
import type { SiteConfig } from '@/database/types';
import { SITE_THEME_BY_ID } from './themes';
import { SITE_PRIMARY_COLOR_BY_ID, SITE_PRIMARY_COLORS } from './colors';
import { SITE_RADIUS_BY_ID } from './radii';
import { SITE_FONT_BY_ID } from './fonts';
import { SITE_HEADING_FONT_BY_ID } from './headingFonts';

type SiteAppearanceConfig = Pick<
  SiteConfig,
  'theme' | 'primaryColor' | 'headingColor' | 'borderRadius' | 'headingFont' | 'bodyFont'
>;

/** Clase para aplicar la fuente de título a un elemento (h1/h2, nombre del
    negocio) junto con su color (--site-heading-color). */
export const SITE_HEADING_CLASS =
  '[font-family:var(--site-heading-font)] text-(--site-heading-color)';

export function getSiteCssVars(config: SiteAppearanceConfig): CSSProperties {
  const theme = SITE_THEME_BY_ID[config.theme];
  /* Fallback al primer color si el guardado guarda un id de una paleta
     vieja (los ids cambiaron de nombre con la paleta nueva). */
  const primaryColor = SITE_PRIMARY_COLOR_BY_ID[config.primaryColor] ?? SITE_PRIMARY_COLORS[0];
  const headingColor = SITE_PRIMARY_COLOR_BY_ID[config.headingColor] ?? primaryColor;
  const radius = SITE_RADIUS_BY_ID[config.borderRadius];
  const bodyFont = SITE_FONT_BY_ID[config.bodyFont];
  const headingFont = SITE_HEADING_FONT_BY_ID[config.headingFont];

  return {
    '--site-bg': theme.colors.background,
    '--site-surface': theme.colors.surface,
    '--site-text': theme.colors.text,
    '--site-text-muted': theme.colors.textMuted,
    '--site-primary': primaryColor.value,
    '--site-primary-foreground': primaryColor.foreground,
    '--site-heading-color': headingColor.value,
    '--site-border': theme.colors.border,
    '--site-radius': radius.value,
    '--site-heading-font': headingFont.stack,
    fontFamily: bodyFont.stack,
  } as CSSProperties;
}
