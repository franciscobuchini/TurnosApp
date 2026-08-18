import { Ban } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface BlockedSlotCardProps {
  /** Cantidad de slots de 15min que ocupa el tramo bloqueado o no disponible contiguo. */
  spanSlots: number;
  /** Mismo alto de fila que usa Schedule.tsx — ver AppointmentCard. */
  rowHeightPx: number;
  className?: string;
  /** Si se pasa, la tarjeta pasa a ser clickeable (ver el motivo/detalles del bloqueo y poder cancelarlo). */
  onClick?: () => void;
}

const CARD_CLASS =
  'absolute inset-x-1 z-10 flex items-center justify-center overflow-hidden rounded-3xl border border-border bg-background/50 text-muted-foreground/50 transition-opacity';

const ICON_CLASS = 'size-4';

export default function BlockedSlotCard({ spanSlots, rowHeightPx, className, onClick }: BlockedSlotCardProps) {
  const heightPx = spanSlots * rowHeightPx - 4;

  return (
    <div
      className={twMerge(
        CARD_CLASS,
        onClick ? 'cursor-pointer hover:opacity-80' : 'pointer-events-none cursor-not-allowed',
        className,
      )}
      style={{ height: `${heightPx}px`, top: '2px' }}
      onClick={onClick}
    >
      <Ban className={ICON_CLASS} />
    </div>
  );
}
