/* 
  src/components/widgets/Schedule.tsx
  Vista diaria de la agenda, organizada por bloques horarios representados con una tabla.
  Estructura: 1 columna fija de horas (invariable) + X columnas de contenido,
  donde X es la cantidad de miembros del equipo seleccionados.
*/

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from '@/components/ui/box';
import Image from '@/components/ui/image';
import { Table, type TableColumn } from '@/components/ui/table';
import { Dropdown } from '@/components/ui/dropdown';
import CurrentTimeLine from '@/components/ui/current-time-line';
import { getAppointmentsByDate, getOpeningHours, getScheduleBlocksByDate, getservices, getTeamMembers } from '@/database/data';
import type { Appointment, FiltersOption } from '@/database/types';
import type { BlockRow, ShiftSlot } from '@/pages/admin/Dashboard';
import { getBusinessHoursByDay, minutesToTime, type TimeRange } from '@/hooks/useWeekSchedule';
import { getCellAvailability, type CellAvailability } from '@/functions/scheduleCellAvailability';
import { DEFAULT_ROW_HEIGHT_PX } from '@/functions/scheduleZoom';
import { SERVICE_COLOR_BY_ID } from '@/components/widgets/serviceWidgets/serviceColors';
import { TeamFilterButton } from '@/components/widgets/sidebarWidgets/DropdownRowActions';
import AppointmentCard from './AppointmentCard';
import ScheduleControls from './ScheduleControls';

interface ScheduleProps {
  selectedDate: Date;
  members: string[];
  className?: string;
  /** Nombres de miembros cuyas columnas quedan bloqueadas (no pueden realizar
      el servicio seleccionado en el flujo "Agregar turno"). */
  blockedMembers?: string[];
  /** Servicio elegido en el flujo "Agregar turno": las celdas disponibles
      muestran, al hacer hover, una vista previa del tamaño del turno según
      la duración de este servicio. */
  previewService?: string | null;
  /** Horario ya elegido en el flujo "Agregar turno", a la espera de que se
      confirme el cliente: se muestra fijo (sin hover) en su celda, y el
      resto de las celdas dejan de ofrecer hint/preview propios. */
  pendingSlot?: ShiftSlot | null;
  /** Se dispara al hacer click en una celda disponible con servicio elegido
      (y sin un horario ya pendiente de confirmar). */
  onSlotClick?: (slot: ShiftSlot) => void;
  /** Se dispara al hacer click en la tarjeta de un turno ya confirmado
      (no en las tarjetas de preview/pending del flujo "Agregar turno"). */
  onAppointmentClick?: (appointment: Appointment) => void;
  /** Fuerza a recalcular los turnos leídos de la BBDD tras crear uno nuevo. */
  appointmentsVersion?: number;
  /** Hora ("HH:mm") del turno recién creado: al montar, hace scroll a la
      fila de esa hora para no perder de vista el turno agregado. */
  scrollToTime?: string | null;
  /** Se avisa cuando el scroll al turno recién creado ya se realizó. */
  onScrollConsumed?: () => void;
  /** Abre el flujo "Agregar turno" (botón flotante, ver ScheduleControls). */
  onOpenAddShift?: () => void;
  /** Flujo "Agregar turno" abierto: el botón flotante pasa a ser una "X"
      que lo cierra (ver ScheduleControls). */
  addShiftOpen?: boolean;
  onCloseAddShift?: () => void;
  /** Filtros del equipo: el header de cada columna de miembro abre el mismo
      dropdown de acciones que el panel Equipo de la sidebar (ocultar/mostrar
      y ver perfil). */
  teamFilters?: FiltersOption[];
  toggleTeamFilter?: (id: string, checked: boolean) => void;
  onMemberDetails?: (name: string) => void;
  /** Flujo "Crear un nuevo bloqueo": sólo 'business-hour' hace algo por
      ahora — activa el modo "click en una fila para bloquearla" en la
      columna de horas. Los otros 3 tipos (día del negocio, hora/día de un
      miembro) todavía no tienen lógica. */
  blockMode?: 'business-hour' | null;
  /** Fila ya elegida en modo bloqueo, a la espera de que se confirme en la
      sidebar — se resalta fija (sin hover) igual que pendingSlot. */
  pendingBlockRow?: BlockRow | null;
  /** Se dispara al hacer click en una fila en modo bloqueo. */
  onBlockRowClick?: (row: BlockRow) => void;
  /** Fuerza a recalcular los bloqueos leídos de la BBDD tras crear uno nuevo. */
  blocksVersion?: number;
}

/* Solo se redondea abajo (rounded-b-3xl): las esquinas de arriba no se ven
   igual aunque se las redondee, porque el header sticky de la tabla no
   respeta el border-radius de su contenedor con scroll (limitación de CSS,
   no un olvido) — queda pegado al borde con esquinas rectas sí o sí. */
/* bg-(--color-surface-solid) en vez de bg-card a propósito: el Schedule es
   una grilla densa de texto/turnos, así que queda afuera del efecto glass
   (blur) que sí llevan el resto de los contenedores de la app — ver Theme.css. */
const SCHEDULE_CLASS = 'relative flex flex-col flex-1 p-0 overflow-hidden rounded-3xl bg-(--color-surface-solid)';

const SCHEDULE_SCROLL_CLASS = 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

const SCHEDULE_CONTENT_CLASS = 'relative';

/* Al cambiar de día, el contenido entra deslizándose en sentido opuesto al
   selector de días (WeekSelector.tsx, ver su propio comentario) a
   propósito: acá, a un día anterior entra desde la izquierda (se percibe
   moviendo hacia la derecha) y a un día siguiente entra desde la derecha
   (se percibe moviendo hacia la izquierda). Sólo se aplica cuando cambia
   el día (ver slideDirection más abajo) — no en el primer render ni en
   re-renders por otros cambios (zoom, nuevo turno, etc.). */
const SCHEDULE_SLIDE_FROM_RIGHT_CLASS = 'animate-in fade-in-0 slide-in-from-right-8 duration-200';
const SCHEDULE_SLIDE_FROM_LEFT_CLASS = 'animate-in fade-in-0 slide-in-from-left-8 duration-200';

const SCHEDULE_TABLE_CLASS = 'bg-(--color-surface-solid)';

const SCHEDULE_TABLE_HEADER_CLASS = 'bg-(--color-surface-solid)';

const SCHEDULE_LABEL_CELL_CLASS = 'relative w-16 text-center';

const SCHEDULE_LABEL_TEXT_CLASS = 'absolute inset-x-0 -top-[5%] -translate-y-1/2 font-thin text-muted-foreground leading-none';

const SCHEDULE_LABEL_HEADER_CLASS = 'sr-only';

const SCHEDULE_SLOT_CELL_CLASS = 'border-t border-border/25 relative group/cell';

const SCHEDULE_MEMBER_HEADER_CLASS = 'flex items-center justify-center gap-2 text-sm font-medium truncate text-muted-foreground';

const SCHEDULE_MEMBER_IMAGE_CLASS = 'h-8 w-8 shrink-0 text-xs';

const SCHEDULE_EMPTY_CLASS = 'absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-sm';

/* Vista previa del turno: la misma AppointmentCard, oculta hasta el hover
   de la celda (así se ve el tamaño real que va a ocupar el servicio
   elegido, sin interceptar clicks ni competir con el hint de "+ Agregar
   turno" que se usa cuando todavía no hay servicio seleccionado). */
const SCHEDULE_PREVIEW_CARD_CLASS = 'opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none z-20';

/* Igual que la preview normal, pero para cuando el turno completo (con la
   duración del servicio elegido) se superpondría con otro turno ya
   existente o se saldría del horario disponible: avisa en vez de mostrar
   el color del servicio como si se pudiera agregar ahí. */
const SCHEDULE_PREVIEW_CONFLICT_CLASS =
  'absolute inset-x-1 z-20 flex items-center justify-center rounded-3xl bg-destructive px-2 text-center text-xs text-foreground opacity-0 transition-opacity group-hover/cell:opacity-100 pointer-events-none cursor-not-allowed';

/* Capa invisible que recibe el click para elegir este horario: ocupa solo
   su propia celda (no el resto del turno, que se dibuja encima con
   pointer-events-none) para no tapar el hover propio de las filas
   siguientes. */
const SCHEDULE_SLOT_CLICK_CLASS = 'absolute inset-1 cursor-pointer rounded-2xl';

/* Recuadro punteado que marca, sin necesidad de hover, cada tramo libre
   donde el servicio elegido entra (ver computeAvailablePreviewRegions): un
   solo recuadro por tramo contiguo (no uno por cada horario posible dentro
   de él), siempre visible, con la línea lo más fina posible. Al pasar el
   mouse la preview de color se dibuja encima (mismo z-10, por debajo de
   SCHEDULE_PREVIEW_CARD_CLASS). */
const SCHEDULE_AVAILABLE_SLOT_CLASS = 'absolute inset-x-0.5 z-10 rounded-3xl border border-dashed border-foreground pointer-events-none';

/* Turno elegido en el Schedule, a la espera de que se confirme el cliente:
   misma tarjeta que la preview pero fija (no depende del hover) y con un
   anillo que la distingue de un turno ya confirmado. */
const SCHEDULE_PENDING_CARD_CLASS = 'ring-2 ring-foreground/70 ring-offset-1 ring-offset-card cursor-default';

const SLOT_DURATION_MINUTES = 15;

/* Colchón que se muestra antes/después del horario real de apertura del
   negocio (1 hora = 4 slots de 15 min), para que la grilla no arranque
   justo en el horario de apertura. */
/* Colchón de celdas extra antes de la apertura y después del cierre del
   negocio, para que el día no arranque/termine exacto en el horario real. */
const BUSINESS_HOURS_PADDING_SLOTS = 30 / SLOT_DURATION_MINUTES;

/* Alto fijo del header de la tabla (TableHead es h-10). */
const HEADER_HEIGHT_PX = 40;

/* Capa que cubre los horarios NO laborales del negocio (antes de abrir,
   después de cerrar y huecos entre tramos): en vez de pintar cada celda de
   otro color, un solo plano bg-background/50 sobre todo el espacio. */
const SCHEDULE_OFF_HOURS_OVERLAY_CLASS =
  'absolute left-16 right-0 z-10 bg-background/50 pointer-events-none';

/* Igual que la niebla de horario no laboral, pero para un ScheduleBlock ya
   confirmado — tinte distinto (destructive en vez de background) para que
   se note que ESTO lo bloqueó el negocio a mano, no que está fuera de
   horario. */
const SCHEDULE_BLOCKED_OVERLAY_CLASS =
  'absolute left-16 right-0 z-10 bg-destructive/15 pointer-events-none';

/* Click target de modo bloqueo ("Bloquear hora del negocio"): cada celda de
   la fila (columna de horas + cada miembro) pone su propio overlay a pantalla
   completa (inset-0, sin radio) para que, pegados unos con otros, se vean
   como una sola franja continua — nada de "cada celda su propio recuadro".
   El hover también tiene que sentirse de toda la fila junta, no celda por
   celda: en vez de :hover propio de cada overlay, usa group-hover contra el
   `group` que Table le pone a cada <tr> (ver table.tsx) — como :hover de un
   elemento ya vale para todos sus ancestros mientras el mouse está sobre
   cualquier hijo, el <tr> entero queda en :hover con sólo pasar por una
   celda, y ahí prende el group-hover de las demás celdas de esa fila a la
   vez. */
const SCHEDULE_BLOCK_ROW_TARGET_CLASS = 'absolute inset-0 z-30 transition-colors';
const SCHEDULE_BLOCK_ROW_PENDING_CLASS = 'bg-destructive/40';
const SCHEDULE_BLOCK_ROW_HOVER_CLASS = 'cursor-pointer group-hover:bg-destructive/20';

/* ── Helpers ────────────────────────────────────────────────── */

/** Convierte "HH:mm" en índice de slot de 15 min (0-95). */
function timeToSlotIndex(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 4 + Math.floor(m / 15);
}

/** Duración de un servicio ("45 min") convertida a slots de 15 min (mínimo 1). */
function durationToSlots(duration: string): number {
  const minutes = parseInt(duration, 10);
  if (!Number.isFinite(minutes) || minutes <= 0) return 1;
  return Math.max(Math.round(minutes / SLOT_DURATION_MINUTES), 1);
}

/** "YYYY-MM-DD" de una fecha local (mismo formato que appointment.date). */
function toDateStr(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Verdadero si el rango [startRow, startRow + spanSlots) no se superpone
    con ningún turno ya existente de ese miembro y todos sus slots están
    disponibles (dentro de horario, no pasados). `startRow` ya se sabe
    disponible (lo valida el caller); acá se revisa el resto del rango. */
function isSpanBookable(
  startRow: number,
  spanSlots: number,
  member: string,
  appointmentMap: Map<string, Map<number, { appointment: Appointment; spanSlots: number }>>,
  checkAvailability: (row: number) => CellAvailability,
): boolean {
  const endRow = startRow + spanSlots;

  const memberAppointments = appointmentMap.get(member);
  if (memberAppointments) {
    for (const [existingStart, existingEntry] of memberAppointments) {
      const existingEnd = existingStart + existingEntry.spanSlots;
      if (startRow < existingEnd && existingStart < endRow) {
        return false;
      }
    }
  }

  for (let row = startRow + 1; row < endRow; row++) {
    if (checkAvailability(row) !== 'available') {
      return false;
    }
  }

  return true;
}

/** Verdadero si `row` cae dentro del rango de un turno que arrancó antes
    (no en `row`) — esa fila no tiene su propia entrada en `appointmentMap`
    (que solo indexa por slot de inicio) pero igual está visualmente ocupada
    por el overflow de la tarjeta del turno anterior, así que no debe
    ofrecer hint ni preview propios. */
function isRowCoveredByExistingAppointment(
  row: number,
  member: string,
  appointmentMap: Map<string, Map<number, { appointment: Appointment; spanSlots: number }>>,
): boolean {
  const memberAppointments = appointmentMap.get(member);
  if (!memberAppointments) return false;

  for (const [start, { spanSlots }] of memberAppointments) {
    if (row >= start && row < start + spanSlots) {
      return true;
    }
  }

  return false;
}

/** Mapa: member -> slotIndex -> appointment (solo el primer slot de cada turno). */
function buildAppointmentMap(appointments: Appointment[]) {
  const map = new Map<string, Map<number, { appointment: Appointment; spanSlots: number }>>();

  for (const apt of appointments) {
    const startSlot = timeToSlotIndex(apt.startTime);
    const endSlot = timeToSlotIndex(apt.endTime);
    const spanSlots = Math.max(endSlot - startSlot, 1);

    if (!map.has(apt.member)) {
      map.set(apt.member, new Map());
    }
    map.get(apt.member)!.set(startSlot, { appointment: apt, spanSlots });
  }

  return map;
}

interface AvailablePreviewRegionsParams {
  members: string[];
  blockedMembers?: string[];
  spanSlots: number;
  selectedDate: Date;
  now: Date;
  businessRanges?: TimeRange[];
  memberRangesByDay: Record<string, Record<number, TimeRange[]>>;
  appointmentMap: Map<string, Map<number, { appointment: Appointment; spanSlots: number }>>;
  windowStartSlot: number;
  windowEndSlot: number;
}

/** Para cada miembro, un único tramo por cada bloque contiguo de filas
    libres (dentro de horario y sin turnos existentes) que sea, al menos,
    tan largo como el servicio elegido — así se marca todo el hueco
    disponible de una vez, en vez de repetir un recuadro del tamaño del
    servicio por cada horario posible dentro de ese mismo hueco. Un mismo
    miembro puede tener varios tramos si el horario tiene cortes (ej.
    almuerzo). */
function computeAvailablePreviewRegions({
  members,
  blockedMembers,
  spanSlots,
  selectedDate,
  now,
  businessRanges,
  memberRangesByDay,
  appointmentMap,
  windowStartSlot,
  windowEndSlot,
}: AvailablePreviewRegionsParams): Map<string, Map<number, number>> {
  const result = new Map<string, Map<number, number>>();

  for (const member of members) {
    const regions = new Map<number, number>();

    if (!blockedMembers?.includes(member)) {
      const isRowOpen = (row: number): boolean =>
        getCellAvailability({
          selectedDate,
          now,
          slotMinutes: row * SLOT_DURATION_MINUTES,
          businessRanges,
          memberRanges: memberRangesByDay[member]?.[selectedDate.getDay()],
          member,
          blockedMembers,
        }) === 'available' && !isRowCoveredByExistingAppointment(row, member, appointmentMap);

      let row = windowStartSlot;
      while (row < windowEndSlot) {
        if (!isRowOpen(row)) {
          row += 1;
          continue;
        }

        const regionStart = row;
        while (row < windowEndSlot && isRowOpen(row)) {
          row += 1;
        }

        if (row - regionStart >= spanSlots) {
          regions.set(regionStart, row - regionStart);
        }
      }
    }

    result.set(member, regions);
  }

  return result;
}

export default function Schedule({
  selectedDate,
  members,
  className,
  blockedMembers,
  previewService,
  pendingSlot,
  onSlotClick,
  onAppointmentClick,
  appointmentsVersion,
  scrollToTime,
  onScrollConsumed,
  onOpenAddShift,
  addShiftOpen = false,
  onCloseAddShift,
  teamFilters,
  toggleTeamFilter,
  onMemberDetails,
  blockMode,
  pendingBlockRow,
  onBlockRowClick,
  blocksVersion,
}: ScheduleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Dirección del slide de entrada al cambiar de día: se compara la fecha
     de este render con la del render anterior. Usa setState-durante-render
     (patrón oficial de React para "ajustar estado cuando cambia una prop",
     ver react.dev/reference/react/useState#storing-information-from-previous-renders)
     en vez de mutar un ref: un ref mutado acá adentro no sobrevive al doble
     render de StrictMode (la segunda invocación ve el ref ya actualizado y
     pierde la dirección antes de llegar a pintarse) — con setState React
     vuelve a renderizar con el estado ya estable antes de que StrictMode
     duplique la invocación, así que ambas pasadas coinciden. Sólo difiere
     de null en el render donde selectedDate efectivamente cambió, así que
     no se dispara en re-renders por otros motivos (zoom, nuevo turno, etc.)
     ni en el primer render. */
  const [previousSelectedDate, setPreviousSelectedDate] = useState(selectedDate);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  if (previousSelectedDate.getTime() !== selectedDate.getTime()) {
    setSlideDirection(selectedDate.getTime() < previousSelectedDate.getTime() ? 'left' : 'right');
    setPreviousSelectedDate(selectedDate);
  }

  /* Único número del que depende el alto de las filas: cambiarlo reacomoda
     a la par la tabla, las AppointmentCard (altura según spanSlots) y el
     reposicionamiento de CurrentTimeLine — ver src/functions/scheduleZoom.ts. */
  const [rowHeightPx, setRowHeightPx] = useState(DEFAULT_ROW_HEIGHT_PX);

  /* Alto real del header de la tabla: la fila del header lleva el mismo
     alto inline que las filas del cuerpo (rowHeightPx), así que no es fijo
     — se mide del DOM (mismo método que CurrentTimeLine) para que la capa
     de horarios no laborales quede alineada con la grilla a cualquier zoom. */
  const [headerHeightPx, setHeaderHeightPx] = useState(HEADER_HEIGHT_PX);
  useLayoutEffect(() => {
    const headerRow = scrollRef.current?.querySelector<HTMLElement>('thead tr');
    if (!headerRow) return;
    setHeaderHeightPx(headerRow.getBoundingClientRect().height);
  }, [rowHeightPx]);

  /* Alto real del contenedor con scroll: hace falta para saber cuántas filas
     entran a pantalla a este zoom (ver windowStartSlot/windowEndSlot más
     abajo) — un día laboral corto con mucho zoom out, si no se estira la
     ventana, deja un hueco vacío debajo de la última fila en vez de mostrar
     algo (aunque sea "fuera de horario"). Se remide en el mismo momento que
     headerHeightPx (cambia de zoom) y también ante un resize de ventana. */
  const [scrollHeightPx, setScrollHeightPx] = useState(0);
  useLayoutEffect(() => {
    const measure = () => {
      if (scrollRef.current) setScrollHeightPx(scrollRef.current.clientHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [rowHeightPx]);

  /* Ticker de un minuto: refresca "now" (turnos vivos/pasados, celdas ya
     pasadas) al mismo ritmo que CurrentTimeLine, sin esperar a que cambie
     otro estado. */
  const [, setNowTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNowTick((tick) => tick + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  /* Horario del local por día: undefined = sin restricción; lista vacía = día
     cerrado (todos los slots bloqueados); con tramos = fuera de horario bloqueado. */
  const businessRanges = useMemo(
    () => getBusinessHoursByDay(getOpeningHours())[selectedDate.getDay()],
    [selectedDate],
  );

  /* Día sin ningún tramo de apertura (ej. domingo cerrado): no tiene sentido
     mostrar la grilla, se reemplaza por el mismo mensaje vacío que "sin
     miembros seleccionados" pero avisando que el día está libre. */
  const isFullyClosed = businessRanges !== undefined && businessRanges.length === 0;

  /* Ventana visible del Schedule: desde el colchón antes de la apertura más
     temprana hasta el colchón después del cierre más tardío de ese día. Sin
     datos de horario (o día cerrado, que de todas formas no renderiza grilla)
     se muestra el día completo.

     Si ese rango (a este rowHeightPx) no llega a llenar el alto real del
     contenedor —día laboral corto + mucho zoom out—, se estira hacia abajo
     (y, si ni así alcanza, también hacia arriba) hasta completarlo: las
     filas de más quedan fuera del rango de negocio, así que
     offHoursRegions (más abajo, calculado a partir de estos mismos límites)
     ya las cubre solo con la niebla de "no disponible" sin ningún cambio
     extra. */
  const { windowStartSlot, windowEndSlot } = useMemo(() => {
    const base = !businessRanges || businessRanges.length === 0
      ? { windowStartSlot: 0, windowEndSlot: 24 * 4 }
      : (() => {
          const starts = businessRanges.map((range) => timeToSlotIndex(range.startTime));
          const ends = businessRanges.map((range) => timeToSlotIndex(range.endTime));
          return {
            windowStartSlot: Math.max(0, Math.min(...starts) - BUSINESS_HOURS_PADDING_SLOTS),
            windowEndSlot: Math.min(24 * 4, Math.max(...ends) + BUSINESS_HOURS_PADDING_SLOTS),
          };
        })();

    if (scrollHeightPx <= 0) return base;

    const availableRows = Math.floor((scrollHeightPx - headerHeightPx) / rowHeightPx);
    const currentRows = base.windowEndSlot - base.windowStartSlot;
    if (currentRows >= availableRows) return base;

    const windowEndSlot = Math.min(24 * 4, base.windowStartSlot + availableRows);
    const stillMissingRows = availableRows - (windowEndSlot - base.windowStartSlot);
    const windowStartSlot = stillMissingRows > 0 ? Math.max(0, base.windowStartSlot - stillMissingRows) : base.windowStartSlot;

    return { windowStartSlot, windowEndSlot };
  }, [businessRanges, scrollHeightPx, headerHeightPx, rowHeightPx]);

  /* Tramos del día que quedan fuera del horario laboral del negocio
     (colchones antes/después de abrir y huecos entre tramos), como rangos
     de slots contiguos: cada uno se cubre con una sola capa. Sin datos de
     horario (undefined) no hay tramos no laborales. */
  const offHoursRegions = useMemo(() => {
    if (!businessRanges || businessRanges.length === 0) return null;

    const segments = businessRanges
      .map((range) => [timeToSlotIndex(range.startTime), timeToSlotIndex(range.endTime)] as const)
      .sort((a, b) => a[0] - b[0]);

    const regions: { startSlot: number; endSlot: number }[] = [];
    let cursor = windowStartSlot;
    for (const [start, end] of segments) {
      if (start > cursor) {
        regions.push({ startSlot: cursor, endSlot: start });
      }
      cursor = Math.min(Math.max(cursor, end), windowEndSlot);
    }
    if (cursor < windowEndSlot) {
      regions.push({ startSlot: cursor, endSlot: windowEndSlot });
    }
    return regions;
  }, [businessRanges, windowStartSlot, windowEndSlot]);

  /* Al montar (o al llegar un nuevo scrollToTime), posiciona el scroll en la
     fila del turno recién creado: queda en el 25% superior de la vista para
     mostrar el turno y algo de contexto por arriba/abajo. */
  useLayoutEffect(() => {
    if (!scrollToTime || !scrollRef.current) return;

    const rowIndex = timeToSlotIndex(scrollToTime);
    const target = Math.max(
      (rowIndex - windowStartSlot) * rowHeightPx - scrollRef.current.clientHeight * 0.25,
      0,
    );
    scrollRef.current.scrollTop = target;
    onScrollConsumed?.();
  }, [scrollToTime, onScrollConsumed, windowStartSlot, rowHeightPx]);

  const slots = Array.from({ length: windowEndSlot - windowStartSlot }, (_, relativeIndex) => {
    const absoluteIndex = windowStartSlot + relativeIndex;
    const totalMinutes = absoluteIndex * 15;
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const displayHour = hour.toString().padStart(2, '0');
    const formattedMinutes = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`;
    return `${displayHour}${formattedMinutes} hs`;
  });

  const appointments = useMemo(() => {
    /* appointmentsVersion no se usa en el cálculo: solo fuerza a releer la
       BBDD cuando se crea un turno nuevo (localStorage no es reactivo). */
    void appointmentsVersion;
    return getAppointmentsByDate(selectedDate);
  }, [selectedDate, appointmentsVersion]);
  const appointmentMap = useMemo(() => buildAppointmentMap(appointments), [appointments]);
  const now = new Date();

  /* Bloqueos de todo el negocio ("Crear un nuevo bloqueo" > "Bloquear hora
     del negocio") para el día que se está viendo — un bloqueo puntual de un
     miembro (`member` presente) todavía no se genera desde ningún lado, así
     que por ahora sólo importan los que no tienen `member`. blocksVersion
     no se usa en el cálculo: sólo fuerza a releer la BBDD tras confirmar un
     bloqueo nuevo (localStorage no es reactivo, mismo motivo que
     appointmentsVersion). */
  const businessBlockedRanges = useMemo(() => {
    void blocksVersion;
    return getScheduleBlocksByDate(selectedDate)
      .filter((block) => !block.member)
      .map((block) => ({ startTime: block.startTime, endTime: block.endTime }));
  }, [selectedDate, blocksVersion]);

  /* Misma idea que offHoursRegions pero para bloqueos ya confirmados:
     convierte cada tramo bloqueado a slots y lo recorta a la ventana
     visible, para pintar la niebla "bloqueado a mano" (ver
     SCHEDULE_BLOCKED_OVERLAY_CLASS) sin tocar offHoursRegions. */
  const blockedRegions = useMemo(() => {
    return businessBlockedRanges
      .map((range) => ({
        startSlot: Math.max(windowStartSlot, timeToSlotIndex(range.startTime)),
        endSlot: Math.min(windowEndSlot, timeToSlotIndex(range.endTime)),
      }))
      .filter((region) => region.endSlot > region.startSlot);
  }, [businessBlockedRanges, windowStartSlot, windowEndSlot]);

  /* Horarios de trabajo de cada miembro, por día: undefined = sin restricción;
     lista vacía = no trabaja (celdas bloqueadas). */
  const memberRangesByDay = useMemo(() => {
    const map: Record<string, Record<number, TimeRange[]>> = {};
    for (const teamMember of getTeamMembers()) {
      const schedule = Array.isArray(teamMember.schedule) ? teamMember.schedule : undefined;
      map[teamMember.name] = getBusinessHoursByDay(schedule);
    }
    return map;
  }, []);

  const computeAvailabilityFor = (member: string, row: number): CellAvailability =>
    getCellAvailability({
      selectedDate,
      now,
      slotMinutes: row * SLOT_DURATION_MINUTES,
      businessRanges,
      memberRanges: memberRangesByDay[member]?.[selectedDate.getDay()],
      member,
      blockedMembers,
      businessBlockedRanges,
    });

  /* Mapa servicio → color/foto y miembro → foto, para pintar cada tarjeta
     con el color del servicio y mostrar los avatares correspondientes. */
  const serviceColorMap = useMemo(() => {
    const services = getservices();
    const map: Record<string, string> = {};
    for (const s of services) {
      if (s.colorId) {
        map[s.name] = SERVICE_COLOR_BY_ID[s.colorId]?.className ?? '';
      }
    }
    return map;
  }, []);

  const servicePhotoMap = useMemo(() => {
    const services = getservices();
    const map: Record<string, string> = {};
    for (const s of services) {
      if (s.photo) map[s.name] = s.photo;
    }
    return map;
  }, []);

  const memberPhotoMap = useMemo(() => {
    const teamMembers = getTeamMembers();
    const map: Record<string, string> = {};
    for (const m of teamMembers) {
      if (m.photo) map[m.name] = m.photo;
    }
    return map;
  }, []);

  /* Servicio elegido en "Agregar turno": tamaño (en slots) y color para la
     vista previa que se muestra al hacer hover sobre una celda disponible. */
  const previewServiceInfo = useMemo(() => {
    if (!previewService) return null;

    const service = getservices().find((s) => s.name === previewService);
    if (!service) return null;

    return {
      name: service.name,
      spanSlots: durationToSlots(service.duration),
      colorClassName: service.colorId ? SERVICE_COLOR_BY_ID[service.colorId]?.className : undefined,
      photo: service.photo,
    };
  }, [previewService]);

  /* Tramos libres (por miembro) donde el servicio elegido entra, para
     marcarlos con un recuadro punteado sin depender del hover — así se ve
     de una todo el hueco disponible, no solo el horario que se está
     mirando. */
  const availablePreviewRegions = useMemo(() => {
    if (!previewServiceInfo) return null;

    return computeAvailablePreviewRegions({
      members,
      blockedMembers,
      spanSlots: previewServiceInfo.spanSlots,
      selectedDate,
      now: new Date(),
      businessRanges,
      memberRangesByDay,
      appointmentMap,
      windowStartSlot,
      windowEndSlot,
    });
  }, [
    previewServiceInfo,
    members,
    blockedMembers,
    selectedDate,
    businessRanges,
    memberRangesByDay,
    appointmentMap,
    windowStartSlot,
    windowEndSlot,
  ]);

  /* Al elegir (o cambiar) el servicio en el flujo "Agregar turno", hace
     scroll hasta el primer turno disponible (el tramo libre más temprano) y
     lo deja arriba de todo de la vista, justo debajo del header fijo de la
     tabla — así el usuario ve de inmediato el primer horario que puede
     tocar, no el medio de la pantalla.
     Con un turno pendiente no corre: el usuario ya eligió dónde, y que el
     Schedule se quede quieto mientras se busca el cliente. */
  useLayoutEffect(() => {
    if (pendingSlot || !previewServiceInfo || !scrollRef.current || !availablePreviewRegions) {
      return;
    }

    let firstStart: number | null = null;
    for (const regions of availablePreviewRegions.values()) {
      for (const [start] of regions) {
        if (firstStart === null || start < firstStart) {
          firstStart = start;
        }
      }
    }
    if (firstStart === null) return;

    /* El header sticky (h-10) tapa la fila si quedara en scrollTop 0; el
       colchón extra deja un poco de aire entre el header y el primer turno
       disponible. */
    const target = Math.max(
      (firstStart - windowStartSlot) * rowHeightPx - 160,
      0,
    );
    scrollRef.current.scrollTop = target;
  }, [pendingSlot, previewServiceInfo, availablePreviewRegions, windowStartSlot, rowHeightPx]);

  const dateStr = useMemo(() => toDateStr(selectedDate), [selectedDate]);

  /* Columna fija de etiquetas de hora: width explícito para que table-fixed no la incluya
     en el reparto equitativo — las columnas de miembros se dividen el espacio sobrante. */
  const labelColumn: TableColumn<string> = {
    key: 'label',
    header: <span className={SCHEDULE_LABEL_HEADER_CLASS}>Horas</span>,
    width: '64px',
    cellClassName: SCHEDULE_LABEL_CELL_CLASS,
    cell: (slot, index) => {
      const absoluteIndex = windowStartSlot + index;
      const labelContent =
        index === 0 ? '' : absoluteIndex % 4 === 0 ? <span className={SCHEDULE_LABEL_TEXT_CLASS}>{slot}</span> : '';

      if (blockMode !== 'business-hour') {
        return labelContent;
      }

      /* Modo bloqueo: toda la fila se representa acá (ver comentario de
         SCHEDULE_BLOCK_ROW_TARGET_CLASS) — clickear cualquier punto de esta
         celda de 64px elige esa hora, sin importar qué miembro esté al lado. */
      const rowStartTime = minutesToTime(absoluteIndex * SLOT_DURATION_MINUTES);
      const rowEndTime = minutesToTime(absoluteIndex * SLOT_DURATION_MINUTES + SLOT_DURATION_MINUTES);

      /* Ya hay una fila elegida (a la espera de confirmarse en la sidebar):
         igual que pendingSlot en las columnas de miembros más abajo, el
         resto deja de ofrecer el target — para cambiarla hay que volver
         primero desde la sidebar, no clickear otra encima. La columna de
         horas tampoco muestra el fondo de "elegida" (SCHEDULE_BLOCK_ROW_PENDING_CLASS)
         acá — sin click ni fondo, queda igual que cualquier otra fila no
         elegida; el resaltado de la fila lo dan las columnas de miembros. */
      if (pendingBlockRow) {
        return labelContent;
      }

      return (
        <>
          {labelContent}
          {/* Sin group-hover acá a propósito: la columna de horas sigue
              siendo click target (elige la fila igual que cualquier otra
              celda), pero no muestra ningún efecto de hover propio — ni al
              pasar el mouse por ella ni al pasarlo por el resto de la fila. */}
          <button
            type="button"
            onClick={() => onBlockRowClick?.({ date: dateStr, startTime: rowStartTime, endTime: rowEndTime })}
            aria-label={`Bloquear horario ${rowStartTime}`}
            className={twMerge(SCHEDULE_BLOCK_ROW_TARGET_CLASS, 'cursor-pointer')}
          />
        </>
      );
    },
  };

  /* Una columna por cada miembro seleccionado. Si no hay ninguno, o si el
     día está cerrado (no tiene sentido mostrar columnas de miembros para un
     día sin horario), se usa una columna vacía sin bordes para mantener el
     layout. */
  const isEmpty = members.length === 0;

  const showBlankGrid = isEmpty || isFullyClosed;

  const memberColumns: TableColumn<string>[] = showBlankGrid
    ? [{ key: 'empty', header: null, cell: () => null }]
    : members.map((member) => {
        const teamFilter = teamFilters?.find((filter) => filter.label === member);
        const memberHeader = (
          <span className={SCHEDULE_MEMBER_HEADER_CLASS}>
            <Image src={memberPhotoMap[member]} name={member} className={SCHEDULE_MEMBER_IMAGE_CLASS} />
            {member}
          </span>
        );

        /* Contenido normal de la celda (turno existente, preview de
           "Agregar turno", o nada) — separado de `cell` para poder
           agregarle encima, sin pisarlo, el target de modo bloqueo (ver más
           abajo): así una fila con turnos existentes se sigue viendo
           mientras se elige si bloquearla. */
        const renderCellContent = (rowIndex: number) => {
          /* rowIndex es la posición dentro de la ventana renderizada (0 =
             windowStartSlot), no el slot absoluto del día: hay que sumarle
             el offset de la ventana para todo lo que compare contra horarios
             reales o contra appointmentMap (indexado por slot absoluto). */
          const absoluteRow = windowStartSlot + rowIndex;
          const memberMap = appointmentMap.get(member);

          const computeAvailability = (row: number): CellAvailability => computeAvailabilityFor(member, row);

          const entry = memberMap?.get(absoluteRow);
          if (!entry) {
            if (isRowCoveredByExistingAppointment(absoluteRow, member, appointmentMap)) return null;

            /* Turno ya elegido en el Schedule, a la espera de que se confirme
               el cliente: se fija en su celda de inicio y el resto de las
               celdas dejan de ofrecer hint/preview hasta que se confirme o
               se cancele. */
            if (pendingSlot) {
              const isPendingStart =
                pendingSlot.member === member && absoluteRow === timeToSlotIndex(pendingSlot.startTime);

              if (isPendingStart && previewServiceInfo) {
                return (
                  <AppointmentCard
                    appointment={{
                      id: 'pending',
                      date: pendingSlot.date,
                      startTime: pendingSlot.startTime,
                      endTime: pendingSlot.endTime,
                      member,
                      client: '',
                      service: previewServiceInfo.name,
                    }}
                    spanSlots={previewServiceInfo.spanSlots}
                    rowHeightPx={rowHeightPx}
                    colorClassName={previewServiceInfo.colorClassName}
                    servicePhoto={previewServiceInfo.photo}
                    className={SCHEDULE_PENDING_CARD_CLASS}
                  />
                );
              }

              return null;
            }

            const availability = computeAvailability(absoluteRow);

            if (availability === 'blocked' || availability === 'past') return null;
            if (!previewServiceInfo) return null;

            if (previewServiceInfo) {
              const heightPx = previewServiceInfo.spanSlots * rowHeightPx - 4;
              const bookable = isSpanBookable(
                absoluteRow,
                previewServiceInfo.spanSlots,
                member,
                appointmentMap,
                computeAvailability,
              );

              if (!bookable) {
                return (
                  <span
                    className={SCHEDULE_PREVIEW_CONFLICT_CLASS}
                    style={{ height: `${heightPx}px`, top: '2px' }}
                  >
                    Este turno se superpone con otro o queda fuera del horario disponible.
                  </span>
                );
              }

              const startTime = minutesToTime(absoluteRow * SLOT_DURATION_MINUTES);
              const endTime = minutesToTime(
                absoluteRow * SLOT_DURATION_MINUTES + previewServiceInfo.spanSlots * SLOT_DURATION_MINUTES,
              );
              const regionLength = availablePreviewRegions?.get(member)?.get(absoluteRow);

              return (
                <>
                  {regionLength !== undefined && (
                    <span
                      className={SCHEDULE_AVAILABLE_SLOT_CLASS}
                      style={{ height: `${regionLength * rowHeightPx - 2}px`, top: '1px' }}
                    />
                  )}
                  <AppointmentCard
                    appointment={{
                      id: 'preview',
                      date: dateStr,
                      startTime,
                      endTime,
                      member,
                      client: '',
                      service: previewServiceInfo.name,
                    }}
                    spanSlots={previewServiceInfo.spanSlots}
                    rowHeightPx={rowHeightPx}
                    colorClassName={previewServiceInfo.colorClassName}
                    servicePhoto={previewServiceInfo.photo}
                    className={SCHEDULE_PREVIEW_CARD_CLASS}
                  />
                  <button
                    type="button"
                    className={SCHEDULE_SLOT_CLICK_CLASS}
                    aria-label={`Agregar turno de ${previewServiceInfo.name} a las ${startTime}`}
                    onClick={() => onSlotClick?.({ member, date: dateStr, startTime, endTime })}
                  />
                </>
              );
            }

            return null;
          }

          const { appointment, spanSlots } = entry;
          const colorClassName = serviceColorMap[appointment.service] || undefined;

          /* Turno "vivo": la línea de hora actual lo está cruzando ahora
             mismo. Se eleva por encima de la niebla del tiempo pasado (z-20,
             CurrentTimeLine) para verse entero y normal mientras lo cruza,
             pero por debajo del header sticky (z-30). Una vez que la línea
             lo termina de pasar, vuelve a z-10 y se ve gris (pasado). */
          const minutesElapsed = now.getHours() * 60 + now.getMinutes();
          const nowSlot = minutesElapsed / 15;
          const startSlot = timeToSlotIndex(appointment.startTime);
          const endSlot = timeToSlotIndex(appointment.endTime);
          const isLive = startSlot <= nowSlot && nowSlot < endSlot;

          return (
            <AppointmentCard
              appointment={appointment}
              spanSlots={spanSlots}
              rowHeightPx={rowHeightPx}
              colorClassName={colorClassName}
              servicePhoto={servicePhotoMap[appointment.service]}
              onClick={onAppointmentClick ? () => onAppointmentClick(appointment) : undefined}
              className={isLive ? 'z-[25]' : undefined}
            />
          );
        };

        return {
          key: `member-${member}`,
          header: (
            <Dropdown
              items={[
                <TeamFilterButton
                  key={member}
                  option={{
                    id: teamFilter?.id ?? member.toLowerCase().replace(/\s+/g, '-'),
                    label: member,
                    checked: teamFilter?.checked,
                  }}
                  onToggle={toggleTeamFilter}
                  onOpenDetails={() => onMemberDetails?.(member)}
                />,
              ]}
              content={memberHeader}
              className="h-10 px-2 rounded-3xl hover:bg-transparent"
            />
          ),
          cellClassName: (_slot: string, rowIndex: number) => {
            /* Las filas donde el negocio abre y cierra llevan la línea de
               border con opacidad completa, para marcar de un vistazo el
               arranque y el fin del horario de atención. */
            const absoluteRow = windowStartSlot + rowIndex;
            const isHoursBoundary =
              businessRanges?.some(
                (range) =>
                  timeToSlotIndex(range.startTime) === absoluteRow ||
                  timeToSlotIndex(range.endTime) === absoluteRow,
              ) ?? false;
            /* Eco visual de la fila elegida en modo bloqueo: el click en sí
               vive en cada celda (ver `cell` más abajo), esto es sólo para
               que se note toda la fila junta. */
            const isPendingBlockRow =
              pendingBlockRow?.date === dateStr &&
              pendingBlockRow.startTime === minutesToTime(absoluteRow * SLOT_DURATION_MINUTES);
            return twMerge(
              SCHEDULE_SLOT_CELL_CLASS,
              isHoursBoundary && 'border-foreground/20',
              isPendingBlockRow && 'bg-destructive/15',
            );
          },
          cell: (_slot: string, rowIndex: number) => {
            const normalContent = renderCellContent(rowIndex);

            if (blockMode !== 'business-hour') return normalContent;

            /* Modo bloqueo: cualquier celda de la fila sirve de target, no
               sólo la columna de horas (ver labelColumn más arriba) — el
               contenido normal sigue debajo (un turno existente, si lo
               hay), no se pisa, sólo se le agrega el target encima. */
            const absoluteRow = windowStartSlot + rowIndex;
            const rowStartTime = minutesToTime(absoluteRow * SLOT_DURATION_MINUTES);
            const rowEndTime = minutesToTime(absoluteRow * SLOT_DURATION_MINUTES + SLOT_DURATION_MINUTES);
            const isPendingRow = pendingBlockRow?.date === dateStr && pendingBlockRow.startTime === rowStartTime;

            if (pendingBlockRow) {
              return (
                <>
                  {normalContent}
                  {isPendingRow && (
                    <span className={twMerge(SCHEDULE_BLOCK_ROW_TARGET_CLASS, SCHEDULE_BLOCK_ROW_PENDING_CLASS)} />
                  )}
                </>
              );
            }

            return (
              <>
                {normalContent}
                <button
                  type="button"
                  onClick={() => onBlockRowClick?.({ date: dateStr, startTime: rowStartTime, endTime: rowEndTime })}
                  aria-label={`Bloquear horario ${rowStartTime}`}
                  className={twMerge(SCHEDULE_BLOCK_ROW_TARGET_CLASS, SCHEDULE_BLOCK_ROW_HOVER_CLASS)}
                />
              </>
            );
          },
        };
      });

  const columns: TableColumn<string>[] = [labelColumn, ...memberColumns];

  /* "Día libre" pisa el aviso de "sin miembros seleccionados": describe mejor
     la situación cuando, además, ese día el negocio no abre. */
  const emptyMessage = isFullyClosed ? 'Día libre' : isEmpty ? 'No hay miembros del equipo seleccionados' : null;

  return (
    <Box className={twMerge(SCHEDULE_CLASS, className)}>
      <ScheduleControls
        rowHeightPx={rowHeightPx}
        onRowHeightChange={setRowHeightPx}
        onAddShift={() => onOpenAddShift?.()}
        addShiftOpen={addShiftOpen}
        onCloseAddShift={onCloseAddShift}
      />
      <div data-schedule-scroll ref={scrollRef} className={SCHEDULE_SCROLL_CLASS}>
        <div
          key={selectedDate.getTime()}
          className={twMerge(
            SCHEDULE_CONTENT_CLASS,
            slideDirection === 'left' && SCHEDULE_SLIDE_FROM_LEFT_CLASS,
            slideDirection === 'right' && SCHEDULE_SLIDE_FROM_RIGHT_CLASS,
          )}
        >
          <Table
            columns={columns}
            rows={slots}
            rowHeightPx={rowHeightPx}
            className={SCHEDULE_TABLE_CLASS}
            headerClassName={SCHEDULE_TABLE_HEADER_CLASS}
            showHeader
            stickyHeader
          />
          {!showBlankGrid && (
            <CurrentTimeLine
              selectedDate={selectedDate}
              windowStartSlot={windowStartSlot}
              windowEndSlot={windowEndSlot}
              rowHeightPx={rowHeightPx}
            />
          )}
          {!showBlankGrid &&
            offHoursRegions?.map((region) => (
              <div
                key={`off-hours-${region.startSlot}`}
                className={SCHEDULE_OFF_HOURS_OVERLAY_CLASS}
                style={{
                  top: headerHeightPx + (region.startSlot - windowStartSlot) * rowHeightPx,
                  height: (region.endSlot - region.startSlot) * rowHeightPx,
                }}
              />
            ))}
          {!showBlankGrid &&
            blockedRegions.map((region) => (
              <div
                key={`blocked-${region.startSlot}`}
                className={SCHEDULE_BLOCKED_OVERLAY_CLASS}
                style={{
                  top: headerHeightPx + (region.startSlot - windowStartSlot) * rowHeightPx,
                  height: (region.endSlot - region.startSlot) * rowHeightPx,
                }}
              />
            ))}
        </div>
      </div>
      {emptyMessage && <div className={SCHEDULE_EMPTY_CLASS}>{emptyMessage}</div>}
    </Box>
  );
}

