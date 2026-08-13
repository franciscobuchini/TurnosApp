/*
  src/components/widgets/mainWidgets/AppointmentCard.tsx
  Tarjeta visual de un turno dentro del Schedule.
  Recibe el appointment, la cantidad de slots que ocupa, el color del
  servicio y la foto (o iniciales, vía Image) del servicio asignado.
*/

import { twMerge } from 'tailwind-merge';
import { User } from 'lucide-react';
import Image from '@/components/ui/image';
import type { Appointment } from '@/database/types';

interface AppointmentCardProps {
  appointment: Appointment;
  spanSlots: number;
  /** Alto en píxeles de un slot de 15 min (ver src/functions/scheduleZoom.ts):
      mismo número que usa Schedule.tsx para sus filas, así la tarjeta siempre
      encaja exacto sin importar el nivel de zoom elegido. */
  rowHeightPx: number;
  colorClassName?: string;
  servicePhoto?: string;
  className?: string;
  onClick?: () => void;
}

const CARD_CLASS =
  'absolute inset-x-1 z-10 rounded-3xl overflow-hidden cursor-pointer text-xs transition-opacity';

const CARD_INNER_CLASS = 'flex flex-col h-full p-2.5 gap-4';

const CARD_HEADER_ROW_CLASS = 'flex min-w-0 items-center gap-2';

const CARD_SERVICE_AVATAR_CLASS = 'size-8 shrink-0 text-sm font-bold text-black';

const CARD_TEXT_COLUMN_CLASS = 'flex min-w-0 flex-1 flex-col';

const CARD_SERVICE_CLASS = 'font-semibold truncate text-black';

const CARD_CLIENT_ROW_CLASS = 'flex min-w-0 items-center gap-1';

const CARD_CLIENT_ICON_CLASS = 'size-3 shrink-0 text-black/50';

const CARD_CLIENT_CLASS = 'truncate text-black/50';

const CARD_NOTES_CLASS = 'truncate text-black/50';

/* La hora va anclada al borde inferior de la tarjeta (referencia siempre
     bottom, aunque la tarjeta sea chica): absoluta respecto de la card. */
const CARD_TIME_CLASS = 'absolute bottom-4.5 right-4.5 max-w-[calc(100%-1rem)] truncate text-right text-xs text-black/50 pointer-events-none';

/* Todos los turnos ya finalizados se ven con este mismo gris, sin importar
   el color del servicio — así se distinguen de un vistazo del resto. */
const CARD_PAST_COLOR_CLASS = 'bg-gray-past';

function isPastAppointment(appointment: Appointment): boolean {
  const end = new Date(`${appointment.date}T${appointment.endTime}`);
  return end.getTime() < Date.now();
}

export default function AppointmentCard({
  appointment,
  spanSlots,
  rowHeightPx,
  colorClassName = 'bg-accent',
  servicePhoto,
  className,
  onClick,
}: AppointmentCardProps) {
  const heightPx = spanSlots * rowHeightPx - 4;
  /* El cliente se muestra solo cuando el turno ya tiene uno asignado (los
     previews/pending del flujo "Agregar turno" todavía no). */
  const showClient = spanSlots >= 2 && Boolean(appointment.client);
  const showNotes = spanSlots >= 3 && Boolean(appointment.notes);
  const resolvedColorClassName = isPastAppointment(appointment) ? CARD_PAST_COLOR_CLASS : colorClassName;

  return (
    <div
      className={twMerge(CARD_CLASS, resolvedColorClassName, className)}
      style={{ height: `${heightPx}px`, top: '2px' }}
      onClick={onClick}
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
      </div>
      <span className={CARD_TIME_CLASS}>
        {appointment.startTime} – {appointment.endTime}
      </span>
    </div>
  );
}
