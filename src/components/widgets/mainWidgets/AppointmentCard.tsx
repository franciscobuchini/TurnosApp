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

/* Dos columnas: izquierda flex-1 con todo el contenido (servicio/cliente/
   notas), derecha angosta con duración + horario. items-stretch para que la
   columna derecha tenga la altura completa de la card y pueda anclar su
   contenido abajo (ver CARD_RIGHT_COLUMN_CLASS) igual que antes hacía el
   bottom-4.5 absoluto. */
const CARD_INNER_CLASS = 'flex h-full items-stretch gap-2 p-2.5';

const CARD_LEFT_COLUMN_CLASS = 'flex min-w-0 flex-1';

/* items-start (no items-center): con notas, el bloque de texto puede tener
   3 líneas (servicio/cliente/notas) — el avatar queda anclado arriba,
   contra la primera línea, en vez de centrarse contra un bloque que crece. */
const CARD_HEADER_ROW_CLASS = 'flex min-w-0 items-start gap-2';

const CARD_SERVICE_AVATAR_CLASS = 'size-8 shrink-0 text-sm font-bold';

/* Notas adentro de esta columna (no como hermano suelto del header row):
   así queda alineada con servicio/cliente, no con el avatar — antes
   arrancaba más a la izquierda que el resto del texto. gap-0.5 en vez del
   gap-4 que separaba el header entero de las notas: son líneas del mismo
   bloque de texto, no dos secciones distintas de la card. */
const CARD_TEXT_COLUMN_CLASS = 'flex min-w-0 flex-1 flex-col gap-0.5';

const CARD_SERVICE_CLASS = 'font-semibold truncate leading-tight';

const CARD_CLIENT_ROW_CLASS = 'flex min-w-0 items-center gap-1';

const CARD_CLIENT_ICON_CLASS = 'size-3 shrink-0';

const CARD_CLIENT_CLASS = 'truncate';

const CARD_NOTES_CLASS = 'truncate text-[11px] leading-tight';

/* Columna derecha: shrink-0 (ancho mínimo posible, el que pida el texto) +
   whitespace-nowrap (nunca hace salto de línea) + justify-end para que
   duración y horario queden anclados abajo, alineados entre sí — mismo
   anclaje al fondo de la card que antes lograba el bottom-4.5 absoluto,
   ahora vía flex en vez de position absolute. pointer-events-none: no es un
   control propio, el click sigue siendo el de toda la card. */
const CARD_RIGHT_COLUMN_CLASS = 'flex shrink-0 flex-col items-end justify-end gap-0.5 whitespace-nowrap pointer-events-none';

const CARD_DURATION_CLASS = 'text-[10px] leading-none';

const CARD_TIME_CLASS = 'text-xs leading-none';

/* Colores de texto por estado: en una tarjeta normal el fondo es el color
   del servicio (pastel), así que el texto va en negro; en una finalizada
   el fondo pasa a ser background/50 (ver CARD_PAST_COLOR_CLASS), que en
   dark theme es oscuro — por eso ahí el texto usa los tokens del tema
   (foreground = claro en dark, oscuro en light). */
const TEXT_PRIMARY_CLASS = 'text-black';
const TEXT_PRIMARY_PAST_CLASS = 'text-foreground';
const TEXT_SECONDARY_CLASS = 'text-black/50';
const TEXT_SECONDARY_PAST_CLASS = 'text-foreground/60';

/* Todos los turnos ya finalizados se ven con este mismo estilo, sin importar
   el color del servicio — mismo background y borde que las cards de bloqueo
   (BlockedSlotCard), así se distinguen de un vistazo del resto. */
const CARD_PAST_COLOR_CLASS = 'border border-border bg-background/50';

function isPastAppointment(appointment: Appointment): boolean {
  const end = new Date(`${appointment.date}T${appointment.endTime}`);
  return end.getTime() < Date.now();
}

/* Duración real del turno (fin - inicio en minutos), no la del service: un
   turno ya creado no debe cambiar de duración mostrada si alguien edita
   después la duración del servicio — mismo formato "<n> min" que ya usa el
   resto de la app (ver FormAddService.tsx). */
function formatAppointmentDuration(appointment: Appointment): string {
  const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
  const [endHour, endMinute] = appointment.endTime.split(':').map(Number);
  const minutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  return `${minutes} min`;
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
  const isPast = isPastAppointment(appointment);
  const resolvedColorClassName = isPast ? CARD_PAST_COLOR_CLASS : colorClassName;
  const textPrimaryClass = isPast ? TEXT_PRIMARY_PAST_CLASS : TEXT_PRIMARY_CLASS;
  const textSecondaryClass = isPast ? TEXT_SECONDARY_PAST_CLASS : TEXT_SECONDARY_CLASS;

  return (
    <div
      className={twMerge(CARD_CLASS, resolvedColorClassName, className)}
      style={{ height: `${heightPx}px`, top: '2px' }}
      onClick={onClick}
    >
      <div className={CARD_INNER_CLASS}>
        <div className={CARD_LEFT_COLUMN_CLASS}>
          <div className={CARD_HEADER_ROW_CLASS}>
            <Image
              src={servicePhoto}
              name={appointment.service}
              className={twMerge(CARD_SERVICE_AVATAR_CLASS, textPrimaryClass)}
            />
            <div className={CARD_TEXT_COLUMN_CLASS}>
              <span className={twMerge(CARD_SERVICE_CLASS, textPrimaryClass)}>{appointment.service}</span>
              {showClient && (
                <div className={CARD_CLIENT_ROW_CLASS}>
                  <User className={twMerge(CARD_CLIENT_ICON_CLASS, textSecondaryClass)} />
                  <span className={twMerge(CARD_CLIENT_CLASS, textSecondaryClass)}>{appointment.client}</span>
                </div>
              )}
              {showNotes && (
                <span className={twMerge(CARD_NOTES_CLASS, textSecondaryClass)}>{appointment.notes}</span>
              )}
            </div>
          </div>
        </div>
        <div className={CARD_RIGHT_COLUMN_CLASS}>
          <span className={twMerge(CARD_DURATION_CLASS, textSecondaryClass)}>
            {formatAppointmentDuration(appointment)}
          </span>
          <span className={twMerge(CARD_TIME_CLASS, textSecondaryClass)}>
            {appointment.startTime} – {appointment.endTime}
          </span>
        </div>
      </div>
    </div>
  );
}
