/*
  src/site/design/fonts.ts
  Fuente de TEXTO del sitio (cuerpo, botones, labels, precios) — legible a
  tamaños chicos. Para los títulos (h1/h2, nombre del negocio) ver
  headingFonts.ts, una fuente "exótica" aparte pensada sólo para eso. Las
  familias se cargan desde Google Fonts vía <link> en index.html para que la
  diferencia visual entre opciones sea real y no cuestión del sistema
  operativo de quien mira la preview.
*/

import type { SiteFontId } from '@/database/types';

export type SiteFontDefinition = {
  id: SiteFontId;
  label: string;
  stack: string;
};

export const SITE_FONTS: SiteFontDefinition[] = [
  { id: 'font-2', label: 'Poppins', stack: "'Poppins', ui-sans-serif, system-ui, sans-serif" },
  { id: 'font-3', label: 'Fraunces', stack: "'Fraunces', ui-serif, Georgia, serif" },
  { id: 'font-4', label: 'Space Grotesk', stack: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif" },
  { id: 'font-8', label: 'Montserrat', stack: "'Montserrat', ui-sans-serif, system-ui, sans-serif" },
];

export const SITE_FONT_BY_ID = Object.fromEntries(
  SITE_FONTS.map((font) => [font.id, font]),
) as Record<SiteFontId, SiteFontDefinition>;
