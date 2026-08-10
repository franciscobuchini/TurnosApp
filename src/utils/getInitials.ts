/* 
  src/utils/getInitials.ts
  Extrae las iniciales de la primera y última palabra de un nombre.
  Si el nombre tiene una sola palabra, devuelve solo la primera letra.
  Ejemplo: "Juan Ignacio Rossi" → "JR", "Balayage" → "B"
*/

export default function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return '';

  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';

  return (first + last).toUpperCase();
}
