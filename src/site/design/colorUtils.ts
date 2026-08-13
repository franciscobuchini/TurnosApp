/*
  src/site/design/colorUtils.ts
  Matemática de color para el sitio: dado cualquier hex elegido a mano
  (HexColorPicker), calcula un color de texto legible encima (contraste
  WCAG) o deriva superficie/texto/borde a partir de un único color de
  fondo — así el usuario sólo elige 3 colores (fondo, botones, títulos) y
  el resto sale solo, sin combinaciones ilegibles.
*/

/** true si `value` es un hex de color válido (3 o 6 dígitos, con o sin #). */
export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/.test(value.trim());
}

// Fallback si llega un valor no-hex (ej. un SiteConfig guardado con un
// esquema de color anterior — ver getSiteConfig): negro, para no romper el
// cálculo en vez de tirar un TypeError.
export function hexToRgb(hex: string): [number, number, number] {
  const clean = isHexColor(hex) ? hex.replace('#', '').trim() : '000000';
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`;
}

/** RGB (0-255) a HSV: h en [0,360), s y v en [0,1]. */
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) h = ((gNorm - bNorm) / delta) % 6;
    else if (max === gNorm) h = (bNorm - rNorm) / delta + 2;
    else h = (rNorm - gNorm) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  return [h, s, max];
}

/** HSV (h en [0,360), s y v en [0,1]) a RGB (0-255). */
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  const [r1, g1, b1] =
    h < 60 ? [c, x, 0] :
    h < 120 ? [x, c, 0] :
    h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] :
    h < 300 ? [x, 0, c] :
    [c, 0, x];

  return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
}

/** Mezcla hexA con hexB; weightB en [0,1] (0 = hexA puro, 1 = hexB puro). */
function mix(hexA: string, hexB: string, weightB: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return rgbToHex([r1 + (r2 - r1) * weightB, g1 + (g2 - g1) * weightB, b1 + (b2 - b1) * weightB]);
}

function channelToLinear(channel255: number): number {
  const c = channel255 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Luminancia relativa WCAG (0 = negro, 1 = blanco). */
export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** Negro o blanco, el que mejor contraste da encima de `hex` (para texto
    sobre un botón/acento de ese color). */
export function getContrastForeground(hex: string): string {
  return getRelativeLuminance(hex) > 0.42 ? '#161616' : '#ffffff';
}

export type DerivedSurfaceColors = {
  surface: string;
  text: string;
  textMuted: string;
  border: string;
};

/** A partir de un único color de fondo, deriva el resto de las superficies
    del sitio (cards, texto, texto secundario, bordes) con contraste
    razonable — así "Color de fondo" alcanza para tener un sitio prolijo,
    sin tener que elegir 4 colores coordinados a mano. */
export function deriveSiteSurfaceColors(backgroundHex: string): DerivedSurfaceColors {
  const isDark = getRelativeLuminance(backgroundHex) < 0.5;

  return {
    surface: mix(backgroundHex, '#ffffff', isDark ? 0.08 : 0.6),
    text: isDark ? '#fafafa' : '#17171a',
    textMuted: mix(backgroundHex, isDark ? '#ffffff' : '#000000', 0.45),
    border: mix(backgroundHex, isDark ? '#ffffff' : '#000000', isDark ? 0.15 : 0.12),
  };
}
