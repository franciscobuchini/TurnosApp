/*
  src/site/design/colors.ts
  Color principal del sitio (acento: botones, CTAs), independiente del theme
  (themes.ts sólo define fondo/superficie/texto). Son todos los colores de
  Tailwind en sus tonos -200 (claro), -500 (medio) y -800 (oscuro), más un
  par de neutros propios (taupe/mauve/mist/olive) — agregar un color nuevo
  es sumar sus 3 hexes a COLOR_HEXES, nada más del sitio cambia.

  El foreground (color de texto encima) se elige por luminosidad: blanco
  sobre los tonos oscuros/medios, oscuro sobre los claros. Excepción: los
  -500 claros (lime/amber/yellow) también llevan texto oscuro.
*/

import type { SitePrimaryColorId } from '@/database/types';

export type SitePrimaryColorDefinition = {
  id: SitePrimaryColorId;
  label: string;
  value: string;
  foreground: string;
};

// [200, 500, 800] — valores del default palette de Tailwind.
const COLOR_HEXES: Record<string, [string, string, string]> = {
  red: ['#fecaca', '#ef4444', '#991b1b'],
  orange: ['#fed7aa', '#f97316', '#9a3412'],
  amber: ['#fde68a', '#f59e0b', '#92400e'],
  yellow: ['#fef08a', '#eab308', '#854d0e'],
  lime: ['#d9f99d', '#84cc16', '#3f6212'],
  green: ['#bbf7d0', '#22c55e', '#166534'],
  emerald: ['#a7f3d0', '#10b981', '#065f46'],
  teal: ['#99f6e4', '#14b8a6', '#115e59'],
  cyan: ['#a5f3fc', '#06b6d4', '#155e75'],
  sky: ['#bae6fd', '#0ea5e9', '#075985'],
  blue: ['#bfdbfe', '#3b82f6', '#1e40af'],
  indigo: ['#c7d2fe', '#6366f1', '#3730a3'],
  violet: ['#ddd6fe', '#8b5cf6', '#5b21b6'],
  purple: ['#e9d5ff', '#a855f7', '#6b21a8'],
  fuchsia: ['#f5d0fe', '#d946ef', '#86198f'],
  pink: ['#fbcfe8', '#ec4899', '#9d174d'],
  rose: ['#fecdd3', '#f43f5e', '#9f1239'],
  slate: ['#e2e8f0', '#64748b', '#1e293b'],
  gray: ['#e5e7eb', '#6b7280', '#1f2937'],
  zinc: ['#e4e4e7', '#71717a', '#27272a'],
  neutral: ['#e5e5e5', '#737373', '#262626'],
  stone: ['#e7e5e4', '#78716c', '#292524'],
  taupe: ['#e7e0d8', '#a08d7f', '#5c4b3f'],
  mauve: ['#e4d8e8', '#a06fa6', '#5c3a63'],
  mist: ['#d9e6f0', '#7ba3c2', '#3d5a73'],
  olive: ['#e3e6c8', '#9aa34a', '#565c1f'],
};

const DARK_FOREGROUND = '#1a1a1a';
const LIGHT_FOREGROUND = '#ffffff';

// -500 claros: texto oscuro (contraste), como los -200.
const MID_DARK_FOREGROUND = new Set(['lime', 'amber', 'yellow']);

export const SITE_PRIMARY_COLORS: SitePrimaryColorDefinition[] = Object.entries(
  COLOR_HEXES,
).flatMap(([name, [hex200, hex500, hex800]]) => [
  { id: `${name}-200`, label: `${name}-200`, value: hex200, foreground: DARK_FOREGROUND },
  {
    id: `${name}-500`,
    label: `${name}-500`,
    value: hex500,
    foreground: MID_DARK_FOREGROUND.has(name) ? DARK_FOREGROUND : LIGHT_FOREGROUND,
  },
  { id: `${name}-800`, label: `${name}-800`, value: hex800, foreground: LIGHT_FOREGROUND },
]);

export const SITE_PRIMARY_COLOR_BY_ID = Object.fromEntries(
  SITE_PRIMARY_COLORS.map((color) => [color.id, color]),
) as Record<string, SitePrimaryColorDefinition>;
