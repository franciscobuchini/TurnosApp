/*
  src/site/design/cssVars.ts
  Traduce un SiteConfig a variables CSS (--site-*) + fontFamily, listas para
  aplicar como `style` en el div raíz del sitio (ver SiteThemeProvider). Los
  componentes del sitio las consumen con la sintaxis de Tailwind v4 para
  variables arbitrarias: bg-(--site-surface), rounded-(--site-radius), etc.

  Sólo 2 colores son elección directa (fondo y primario — ver
  HexColorPicker): el primario cubre tanto botones/CTAs como títulos (antes
  eran 2 campos separados, primaryColor/headingColor, pero se unificaron —
  ver SiteConfig.primaryColor). Superficie/texto/texto-muted/borde y el
  color de texto sobre los botones se derivan automáticamente
  (colorUtils.ts) para garantizar contraste legible sin que el usuario
  tenga que combinar varios colores a mano.

  La fuente de título (--site-heading-font) es aparte de fontFamily (que fija
  la fuente de texto, heredada por defecto): sólo los elementos con
  SITE_HEADING_FONT_CLASS la usan — ver headingFonts.ts.
*/

import type { CSSProperties } from 'react';
import type { SiteConfig } from '@/database/types';
import { deriveSiteSurfaceColors, getContrastForeground } from './colorUtils';
import { SITE_RADII, SITE_RADIUS_BY_ID } from './radii';
import { SITE_FONT_BY_ID, SITE_FONTS } from './fonts';
import { SITE_HEADING_FONT_BY_ID, SITE_HEADING_FONTS } from './headingFonts';

type SiteAppearanceConfig = Pick<
  SiteConfig,
  'backgroundColor' | 'primaryColor' | 'borderRadius' | 'headingFont' | 'bodyFont'
>;

/** Clase para aplicar la fuente de título a un elemento (h1/h2, nombre del
    negocio) junto con su color (--site-heading-color, igual al primario). */
export const SITE_HEADING_CLASS =
  '[font-family:var(--site-heading-font)] text-(--site-heading-color)';

export function getSiteCssVars(config: SiteAppearanceConfig): CSSProperties {
  const surfaceColors = deriveSiteSurfaceColors(config.backgroundColor);
  const primaryForeground = getContrastForeground(config.primaryColor);
  // Fallback al primer valor de cada lista si el id guardado ya no existe
  // ahí (p.ej. se sacó una fuente/radio de la lista después de guardado) —
  // mismo motivo que el saneo de colores en siteConfig.ts.
  const radius = SITE_RADIUS_BY_ID[config.borderRadius] ?? SITE_RADII[0];
  const bodyFont = SITE_FONT_BY_ID[config.bodyFont] ?? SITE_FONTS[0];
  const headingFont = SITE_HEADING_FONT_BY_ID[config.headingFont] ?? SITE_HEADING_FONTS[0];

  return {
    '--site-bg': config.backgroundColor,
    '--site-surface': surfaceColors.surface,
    '--site-text': surfaceColors.text,
    '--site-text-muted': surfaceColors.textMuted,
    // Pisa el --avatar-text del admin (ver Theme.css e Image.tsx): los
    // placeholders de foto en el sitio público deben contrastar contra el
    // fondo QUE ELIGIÓ el negocio, no contra el tema del panel admin.
    '--avatar-text': surfaceColors.text,
    '--site-primary': config.primaryColor,
    '--site-primary-foreground': primaryForeground,
    '--site-heading-color': config.primaryColor,
    '--site-border': surfaceColors.border,
    '--site-radius': radius.value,
    '--site-heading-font': headingFont.stack,
    fontFamily: bodyFont.stack,
  } as CSSProperties;
}
