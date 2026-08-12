/*
  src/utils/formatCapitalizedWords.ts
  Capitaliza la primera letra de cada palabra (resto en minúscula), preservando
  un espacio final si el usuario lo está por escribir (para no interrumpir
  mientras tipea entre palabras). Usado por los forms de miembro/cliente/
  servicio para nombres/roles/etc.
*/

export default function formatCapitalizedWords(value: string): string {
  const hasTrailingSpace = /\s$/.test(value);
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return '';
  }

  const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  return hasTrailingSpace ? `${formattedWords.join(' ')} ` : formattedWords.join(' ');
}
