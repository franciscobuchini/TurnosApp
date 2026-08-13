/*
  src/site/design/headingFonts.ts
  Fuente de TÍTULO del sitio: sólo se aplica a h1/h2 y al nombre del negocio
  (ver SITE_HEADING_FONT_CLASS en cssVars.ts) — nunca al texto de párrafos,
  botones o labels, así que acá sí valen fuentes "exóticas" (display, muy
  marcadas) que no funcionarían bien como fuente de lectura general. Cargadas
  desde Google Fonts en index.html, igual que fonts.ts.
*/

import type { SiteHeadingFontId } from '@/database/types';

export type SiteHeadingFontDefinition = {
  id: SiteHeadingFontId;
  label: string;
  stack: string;
};

export const SITE_HEADING_FONTS: SiteHeadingFontDefinition[] = [
  { id: 'heading-1', label: 'Fugaz One', stack: "'Fugaz One', cursive" },
  { id: 'heading-3', label: 'Pacifico', stack: "'Pacifico', cursive" },
  { id: 'heading-5', label: 'Cinzel', stack: "'Cinzel', ui-serif, Georgia, serif" },
  { id: 'heading-6', label: 'Bungee', stack: "'Bungee', cursive" },
  { id: 'heading-7', label: 'Rye', stack: "'Rye', cursive" },
  { id: 'heading-8', label: 'Lobster', stack: "'Lobster', cursive" },
  { id: 'heading-9', label: 'Limelight', stack: "'Limelight', cursive" },
  { id: 'heading-10', label: 'Press Start 2P', stack: "'Press Start 2P', cursive" },
  { id: 'heading-11', label: 'Orbitron', stack: "'Orbitron', ui-sans-serif, system-ui, sans-serif" },
  { id: 'heading-12', label: 'Chonburi', stack: "'Chonburi', ui-serif, Georgia, serif" },
  { id: 'heading-13', label: 'Titan One', stack: "'Titan One', cursive" },
  { id: 'heading-15', label: 'Comfortaa', stack: "'Comfortaa', ui-sans-serif, system-ui, sans-serif" },
];

export const SITE_HEADING_FONT_BY_ID = Object.fromEntries(
  SITE_HEADING_FONTS.map((font) => [font.id, font]),
) as Record<SiteHeadingFontId, SiteHeadingFontDefinition>;
