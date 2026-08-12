/*
  src/utils/fuzzyMatch.ts
  Coincidencia flexible para buscadores de texto libre (ej. buscador de
  clientes): no exige que lo tipeado sea exacto ni esté completo.
*/

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function isSubsequence(query: string, target: string): boolean {
  let queryIndex = 0;
  for (let targetIndex = 0; targetIndex < target.length && queryIndex < query.length; targetIndex++) {
    if (target[targetIndex] === query[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === query.length;
}

/** Verdadero si `target` "razonablemente" coincide con `query`: ignora
    mayúsculas/acentos, acepta las palabras en cualquier orden (ej. "Pérez
    Juan" encuentra a "Juan Pérez") y, como último recurso, tolera letras
    salteadas o de más — para no exigirle precisión a lo que se tipea. */
export function fuzzyMatch(query: string, target: string): boolean {
  const q = normalize(query);
  if (!q) return true;

  const t = normalize(target);
  if (t.includes(q)) return true;

  const queryWords = q.split(/\s+/).filter(Boolean);
  if (queryWords.length > 1 && queryWords.every((word) => t.includes(word))) {
    return true;
  }

  return isSubsequence(q, t);
}
