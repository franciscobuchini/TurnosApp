/*
  src/utils/slugify.ts
  Texto libre a slug de URL: minusculas, sin acentos, sin caracteres
  especiales. Usado para derivar la URL del negocio ("minube.site/<url>") a
  partir de su nombre en el wizard de bienvenida (ver OnboardingWizard).
*/

// Rango Unicode de "combining diacritical marks" (0x0300-0x036f): lo que
// normalize('NFD') separa de una letra acentuada (ej. "e" + acento agudo).
// Se compara por código en vez de un regex con el rango literal para no
// depender de cómo el entorno de edición serialice esos caracteres.
const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;

function stripDiacritics(value: string): string {
  let result = '';
  for (const char of value.normalize('NFD')) {
    const code = char.codePointAt(0) ?? 0;
    if (code < COMBINING_DIACRITICS_START || code > COMBINING_DIACRITICS_END) {
      result += char;
    }
  }
  return result;
}

export function slugify(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
