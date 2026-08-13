/*
  src/components/widgets/mainWidgets/BlockedCell.tsx
  Estado visual "Bloqueado" para celdas del Schedule: horario fuera del
  horario laboral del negocio (o del miembro). Sin background-color propio
  — SCHEDULE_FOG_CLASS es la "niebla" compartida con el overlay de tiempo
  pasado de current-time-line.tsx (misma capa, dos usos), para que ambas
  categorías de "no disponible" se vean consistentes entre sí.
*/

import { twMerge } from 'tailwind-merge';

/* "Niebla": solo desatura lo que haya detrás (turno, línea de grilla, etc.),
   sin sumar ningún color/tono propio (ni de fondo ni de brillo). */
export const SCHEDULE_FOG_CLASS = 'backdrop-grayscale';

export const BLOCKED_CELL_CLASS = twMerge(
  'absolute inset-0 cursor-not-allowed select-none pointer-events-none',
  SCHEDULE_FOG_CLASS,
);

interface BlockedCellProps {
  className?: string;
}

export default function BlockedCell({ className }: BlockedCellProps) {
  return <span className={twMerge(BLOCKED_CELL_CLASS, className)} />;
}