/*
  src/components/widgets/mainWidgets/AppointmentCard.tsx
  Tarjeta visual de un turno dentro del Schedule.
  Recibe el appointment, la cantidad de slots que ocupa, el color del
  servicio y la foto (o iniciales, vía Image) del servicio asignado. Los
  turnos ya finalizados se atenúan con opacity-30.
*/

import { twMerge } from 'tailwind-merge';
import { User } from 'lucide-react';
import Image from '@/components/ui/image';
import type { Appointment } from '@/database/types';

interface AppointmentCardProps {
  appointment: Appointment;
  spanSlots: number;
  colorClassName?: string;
  servicePhoto?: string;
  className?: string;
}

const SLOT_HEIGHT_PX = 48;

const CARD_CLASS =
  'absolute inset-x-1 z-10 rounded-3xl overflow-hidden cursor-pointer text-xs transition-opacity';

const CARD_PAST_CLASS = 'opacity-30';

const CARD_INNER_CLASS = 'flex flex-col h-full p-1.5 gap-4';

const CARD_HEADER_ROW_CLASS = 'flex min-w-0 items-center gap-2';

const CARD_SERVICE_AVATAR_CLASS = 'size-8 shrink-0 text-sm font-bold bg-background text-foreground';

const CARD_TEXT_COLUMN_CLASS = 'flex min-w-0 flex-1 flex-col';

const CARD_SERVICE_CLASS = 'font-semibold truncate text-black';

const CARD_CLIENT_ROW_CLASS = 'flex min-w-0 items-center gap-1';

const CARD_CLIENT_ICON_CLASS = 'size-3 shrink-0 text-black/50';

const CARD_CLIENT_CLASS = 'truncate text-black/50';

const CARD_NOTES_CLASS = 'truncate text-black/50';

const CARD_TIME_CLASS = 'mt-auto text-xs text-black/50 p-1';

function isPastAppointment(appointment: Appointment): boolean {
  const end = new Date(`${appointment.date}T${appointment.endTime}`);
  return end.getTime() < Date.now();
}

export default function AppointmentCard({
  appointment,
  spanSlots,
  colorClassName = 'bg-accent',
  servicePhoto,
  className,
}: AppointmentCardProps) {
  const heightPx = spanSlots * SLOT_HEIGHT_PX - 4;
  const showClient = spanSlots >= 2;
  const showNotes = spanSlots >= 3 && Boolean(appointment.notes);
  const showTime = spanSlots >= 3;
  const isPast = isPastAppointment(appointment);

  return (
    <div
      className={twMerge(CARD_CLASS, colorClassName, isPast && CARD_PAST_CLASS, className)}
      style={{ height: `${heightPx}px`, top: '2px' }}
    >
      <div className={CARD_INNER_CLASS}>
        <div className={CARD_HEADER_ROW_CLASS}>
          <Image
            src={servicePhoto}
            name={appointment.service}
            className={CARD_SERVICE_AVATAR_CLASS}
          />
          <div className={CARD_TEXT_COLUMN_CLASS}>
            <span className={CARD_SERVICE_CLASS}>{appointment.service}</span>
            {showClient && (
              <div className={CARD_CLIENT_ROW_CLASS}>
                <User className={CARD_CLIENT_ICON_CLASS} />
                <span className={CARD_CLIENT_CLASS}>{appointment.client}</span>
              </div>
            )}
          </div>
        </div>
        {showNotes && (
          <span className={CARD_NOTES_CLASS}>{appointment.notes}</span>
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
