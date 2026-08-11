/*
  src/components/widgets/mainWidgets/AppointmentCard.tsx
  Tarjeta visual de un turno dentro del Schedule.
  Recibe el appointment, la cantidad de slots que ocupa y el color del servicio.
*/

import { twMerge } from 'tailwind-merge';
import type { Appointment } from '@/database/types';

interface AppointmentCardProps {
  appointment: Appointment;
  spanSlots: number;
  colorClassName?: string;
  className?: string;
}

const SLOT_HEIGHT_PX = 48;

const CARD_CLASS =
  'absolute inset-x-1 z-10 rounded-3xl overflow-hidden cursor-pointer text-xs';

const CARD_INNER_CLASS = 'flex flex-col h-full p-4 gap-1';

const CARD_SERVICE_CLASS = 'font-semibold truncate text-black';

const CARD_CLIENT_CLASS = 'truncate text-black/60';

const CARD_TIME_CLASS = 'mt-auto text-[10px] text-black/45';

export default function AppointmentCard({
  appointment,
  spanSlots,
  colorClassName = 'bg-accent',
  className,
}: AppointmentCardProps) {
  const heightPx = spanSlots * SLOT_HEIGHT_PX - 4;
  const showClient = spanSlots >= 2;
  const showTime = spanSlots >= 3;

  return (
    <div
      className={twMerge(CARD_CLASS, colorClassName, className)}
      style={{ height: `${heightPx}px`, top: '2px' }}
    >
      <div className={CARD_INNER_CLASS}>
        <span className={CARD_SERVICE_CLASS}>{appointment.service}</span>
        {showClient && (
          <span className={CARD_CLIENT_CLASS}>{appointment.client}</span>
        )}
        {showTime && (
          <span className={CARD_TIME_CLASS}>
            {appointment.startTime} – {appointment.endTime}
          </span>
        )}
      </div>
    </div>
  );
}
