/* 
  src/components/widgets/mainWidgets/BlockedCell.tsx
  Estado visual "Bloqueado" para celdas del Schedule: la celda se ve más
  oscura/opaca (light theme) o más clara (dark theme) para indicar que ese
  horario no se puede reservar. Se usa por ejemplo cuando el negocio está
  cerrado. Se aplica por celda dentro del render de la columna (Table.cell).
*/

import { twMerge } from 'tailwind-merge';

export const BLOCKED_CELL_CLASS =
  'absolute inset-0 bg-current/8 cursor-not-allowed select-none pointer-events-none';

interface BlockedCellProps {
  className?: string;
}

export default function BlockedCell({ className }: BlockedCellProps) {
  return <span className={twMerge(BLOCKED_CELL_CLASS, className)} />;
}