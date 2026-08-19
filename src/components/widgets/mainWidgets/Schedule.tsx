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

import type { Appointment, FiltersOption, ScheduleBlock } from '@/database/types';
import type { ShiftSlot } from '@/pages/admin/Dashboard';
import { getBusinessHoursByDay, minutesToTime, rangesCoverFullDay, type TimeRange } from '@/hooks/useWeekSchedule';
import { getCellAvailability, type CellAvailability } from '@/functions/scheduleCellAvailability';
import { DEFAULT_ROW_HEIGHT_PX } from '@/functions/scheduleZoom';
import { SERVICE_COLOR_BY_ID } from '@/components/widgets/serviceWidgets/serviceColors';
import { TeamFilterButton } from '@/components/widgets/sidebarWidgets/DropdownRowActions';
import AppointmentCard from './AppointmentCard';
import BlockedSlotCard from './BlockedSlotCard';
import ScheduleControls from './ScheduleControls';
import {
  toggleCellBlockState,
  toggleRowBlockState,
  toggleMemberDayBlockState,
} from '@/functions/blockToggleOperations';

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
  /** Modo unificado de "Bloqueos / Desbloqueos" interactivo */
  blockModeOpen?: boolean;
  onToggleBlockMode?: () => void;
  onSaveBlockMode?: () => void;
  onCancelBlockMode?: () => void;
  onNoticeMessage?: (message: string) => void;
  onBlocksVersionChange?: () => void;
  /** Filtros del equipo: el header de cada columna de miembro abre el mismo
      dropdown de acciones que el panel Equipo de la sidebar (ocultar/mostrar
      y ver perfil). */
  teamFilters?: FiltersOption[];
  toggleTeamFilter?: (id: string, checked: boolean) => void;
  onMemberDetails?: (name: string) => void;
  /** Se dispara al hacer click en una tarjeta "Horario bloqueado" ya
      confirmada (no en el flujo de creación) — mismo criterio que
      onAppointmentClick para turnos. */
  onBlockClick?: (block: ScheduleBlock) => void;
  /** Fuerza a recalcular los bloqueos leídos de la BBDD tras crear uno nuevo. */
  blocksVersion?: number;
  /** Se dispara con cuántas columnas de miembro entran en el ancho real
      medido (ver visibleColumnCount) — quien arma `members` (useTeamFilters,
      vía Dashboard) lo usa para mantener "Equipo" en sincro con lo que
      realmente se puede mostrar (ver el comentario de useTeamFilters.ts). */
  onColumnCapacityChange?: (count: number) => void;
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
const SCHEDULE_LABEL_CELL_COMPACT_CLASS = 'w-11 px-1';

const SCHEDULE_LABEL_TEXT_CLASS = 'absolute inset-x-0 -top-[5%] -translate-y-1/2 font-thin text-muted-foreground leading-none';
const SCHEDULE_LABEL_TEXT_COMPACT_CLASS = 'text-xs';

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

/* Ancho de la columna fija de horas — también sirve para calcular cuántas
   columnas de miembro entran en el ancho real (ver visibleColumnCount). */
const LABEL_COLUMN_WIDTH_PX = 64;
const LABEL_COLUMN_COMPACT_WIDTH_PX = 44;
const SCHEDULE_COMPACT_WIDTH_PX = 520;

/* Ancho mínimo legible de una columna de miembro (avatar + nombre en el
   header, AppointmentCard con hora/servicio adentro): por debajo de esto se
   prefiere ocultar la columna entera antes que angostarla hasta ser
   ilegible. Misma "lógica responsive" que DaySelectorButtons.tsx (ocultar
   por falta de espacio en vez de encoger sin límite), pero acá el ancho se
   mide de verdad (ResizeObserver, ver scrollWidthPx) en vez de breakpoints
   @container fijos — a diferencia de los 7 días fijos de la semana, la
   cantidad de columnas es variable (depende de cuántos miembros están
   tildados en Equipo). Subido de 140 a 200: con 140 las columnas quedaban
   demasiado angostas (turnos ilegibles) antes de que la app empezara a
   ocultarlas — el recorte tiene que arrancar en una resolución más alta,
   con más margen. */
const MIN_MEMBER_COLUMN_WIDTH_PX = 200;

/* Click target de modo bloqueo ("Bloquear hora del negocio" y "Bloquear
   horario de un miembro"): cada celda que participa pone su propio overlay
   a pantalla completa (inset-0, sin radio) — en 'business-hour' eso hace
   que, pegadas unas con otras, se vean como una sola franja continua (nada
   de "cada celda su propio recuadro"); en 'member-hour' es una única celda,
   así que alcanza con el target de esa celda sola. Target y fill
   "pendiente" son los mismos en los dos modos (SCHEDULE_BLOCK_TARGET_CLASS/
   SCHEDULE_BLOCK_PENDING_CLASS) — sólo cambia el hover, que sí tiene que
   sentirse distinto según el alcance de cada modo (ver los dos hover de
   abajo). */
const SCHEDULE_BLOCK_CELL_HOVER_CLASS = 'cursor-pointer hover:bg-destructive/20';
const SCHEDULE_UNBLOCK_CELL_HOVER_CLASS = 'cursor-pointer hover:bg-(--palette-01)/30';


/* Target de modo bloqueo para las celdas de un miembro (member-hour): a
   diferencia del de fila (SCHEDULE_BLOCK_TARGET_CLASS, celda completa), el
   hover acá tiene las mismas dimensiones y esquinas que una AppointmentCard
   — un "objeto" dentro de la celda con airs lateral/arriba y esquinas
   rounded (inset-x-1 + top 2px + alto rowHeightPx - 4, ver el style en el
   button), no la celda entera pintada. */
const SCHEDULE_BLOCK_CELL_TARGET_CLASS = 'absolute inset-x-1 z-20 rounded-3xl transition-colors';

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

/** Rangos bloqueados de este miembro (bloqueo de negocio + de él en
    particular, fundidos entre sí si se superponen) convertidos a slots y
    recortados a la ventana visible — mismo criterio que offHoursRegions,
    pero por columna. Sirve para saber dónde arranca cada tramo bloqueado
    contiguo y cuánto dura, así BlockedSlotCard se dibuja una sola vez por
    tramo (no una por cada slot de 15min que lo compone) — mismo patrón
    que buildAppointmentMap/isRowCoveredByExistingAppointment para turnos. */
function computeMemberBlockedRegions(
  businessBlockedRanges: TimeRange[],
  memberBlockedRanges: TimeRange[] | undefined,
  windowStartSlot: number,
  windowEndSlot: number,
): { startSlot: number; endSlot: number }[] {
  const allRanges = [...businessBlockedRanges, ...(memberBlockedRanges ?? [])];
  if (allRanges.length === 0) return [];

  const sorted = [...allRanges].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const merged: TimeRange[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i].startTime <= last.endTime) {
      if (sorted[i].endTime > last.endTime) last.endTime = sorted[i].endTime;
    } else {
      merged.push({ ...sorted[i] });
    }
  }

  return merged
    .map((range) => ({
      startSlot: Math.max(windowStartSlot, timeToSlotIndex(range.startTime)),
      endSlot: Math.min(windowEndSlot, timeToSlotIndex(range.endTime)),
    }))
    .filter((region) => region.endSlot > region.startSlot);
}

interface ColumnBlockedCard {
  startSlot: number;
  endSlot: number;
  block?: ScheduleBlock;
}

/** Calcula todas las tarjetas de bloqueo para una columna de miembro:
    incluye tanto los bloqueos explícitos (ScheduleBlock) como los tramos fuera
    de horario / no disponibles (horario laboral del negocio, del miembro o servicio no aplicable). */
function computeColumnBlockedCards(
  member: string,
  windowStartSlot: number,
  windowEndSlot: number,
  businessBlockedRanges: TimeRange[],
  memberBlockedRanges: TimeRange[] | undefined,
  scheduleBlocksThatDay: ScheduleBlock[],
  computeAvailability: (row: number) => CellAvailability,
  appointmentMap: Map<string, Map<number, { appointment: Appointment; spanSlots: number }>>,
): ColumnBlockedCard[] {
  // 1. Bloqueos explícitos (ScheduleBlock con type !== 'unblock')
  const explicitRegions = computeMemberBlockedRegions(
    businessBlockedRanges,
    memberBlockedRanges,
    windowStartSlot,
    windowEndSlot,
  );

  const explicitCards: ColumnBlockedCard[] = explicitRegions.map((region) => {
    const matchingBlock = scheduleBlocksThatDay.find(
      (b) =>
        (!b.member || b.member === member) &&
        b.type !== 'unblock' &&
        timeToSlotIndex(b.startTime) <= region.startSlot &&
        timeToSlotIndex(b.endTime) >= region.endSlot,
    );
    return {
      startSlot: region.startSlot,
      endSlot: region.endSlot,
      block: matchingBlock,
    };
  });

  const isCoveredByExplicit = (row: number) =>
    explicitCards.some((card) => row >= card.startSlot && row < card.endSlot);

  // 2. Horarios no disponibles / fuera de jornada laboral / sin calificación
  const offHoursCards: ColumnBlockedCard[] = [];
  let row = windowStartSlot;
  while (row < windowEndSlot) {
    const isAppt = isRowCoveredByExistingAppointment(row, member, appointmentMap);
    const isExpl = isCoveredByExplicit(row);
    const isBlocked = computeAvailability(row) === 'blocked';

    if (isBlocked && !isAppt && !isExpl) {
      const start = row;
      while (
        row < windowEndSlot &&
        computeAvailability(row) === 'blocked' &&
        !isRowCoveredByExistingAppointment(row, member, appointmentMap) &&
        !isCoveredByExplicit(row)
      ) {
        row++;
      }
      offHoursCards.push({ startSlot: start, endSlot: row });
    } else {
      row++;
    }
  }

  return [...explicitCards, ...offHoursCards].sort((a, b) => a.startSlot - b.startSlot);
}

function isRowCoveredByBlockedCard(row: number, cards: ColumnBlockedCard[]): boolean {
  for (const card of cards) {
    if (row > card.startSlot && row < card.endSlot) {
      return true;
    }
  }
  return false;
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
  /** Bloqueos a mano ("Crear un nuevo bloqueo") — mismos datos que ya usa
      computeAvailabilityFor, hacen falta acá también para que el hueco
      "disponible" se corte alrededor de un bloqueo (y retome del otro
      lado, si sigue habiendo lugar) en vez de dibujarse derecho por
      encima, como si el bloqueo no existiera. */
  businessBlockedRanges?: TimeRange[];
  memberBlockedRangesByMember?: Record<string, TimeRange[]>;
  businessUnblockedRanges?: TimeRange[];
  memberUnblockedRangesByMember?: Record<string, TimeRange[]>;
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
  businessBlockedRanges,
  memberBlockedRangesByMember,
  businessUnblockedRanges,
  memberUnblockedRangesByMember,
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
          businessBlockedRanges,
          memberBlockedRanges: memberBlockedRangesByMember?.[member],
          businessUnblockedRanges,
          memberUnblockedRanges: memberUnblockedRangesByMember?.[member],
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
  blockModeOpen = false,
  onToggleBlockMode,
  onSaveBlockMode,
  onCancelBlockMode,
  onNoticeMessage,
  onBlocksVersionChange,
  teamFilters,
  toggleTeamFilter,
  onMemberDetails,
  onBlockClick,
  blocksVersion,
  onColumnCapacityChange,
}: ScheduleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Hover de fila (horas) y de columna (miembro) en modo bloqueos */
  const [hoveredRowSlot, setHoveredRowSlot] = useState<number | null>(null);
  const [hoveredMemberColumn, setHoveredMemberColumn] = useState<string | null>(null);

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
  /* Ancho real del contenedor con scroll — determina cuántas columnas de
     miembro entran (ver visibleColumnCount más abajo). */
  const [scrollWidthPx, setScrollWidthPx] = useState(0);
  /* ResizeObserver en vez de (o además de) un listener de window: el ancho/
     alto disponible también cambia cuando se abre/cierra un panel de la
     sidebar sin que la ventana en sí cambie de tamaño, y un listener de
     'resize' no se entera de eso. */
  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const measure = () => {
      setScrollHeightPx(node.clientHeight);
      setScrollWidthPx(node.clientWidth);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
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

  /* Bloqueos y desbloqueos para el día que se está viendo. */
  const {
    businessBlockedRanges,
    businessUnblockedRanges,
    memberBlockedRangesByMember,
    memberUnblockedRangesByMember,
    scheduleBlocksThatDay,
  } = useMemo(() => {
    void blocksVersion;
    const blocksThatDay = getScheduleBlocksByDate(selectedDate);

    const businessBlocked: TimeRange[] = [];
    const businessUnblocked: TimeRange[] = [];
    const byMemberBlocked: Record<string, TimeRange[]> = {};
    const byMemberUnblocked: Record<string, TimeRange[]> = {};

    for (const block of blocksThatDay) {
      const range = { startTime: block.startTime, endTime: block.endTime };
      if (block.member) {
        if (block.type === 'unblock') {
          (byMemberUnblocked[block.member] ??= []).push(range);
        } else {
          (byMemberBlocked[block.member] ??= []).push(range);
        }
      } else {
        if (block.type === 'unblock') {
          businessUnblocked.push(range);
        } else {
          businessBlocked.push(range);
        }
      }
    }

    return {
      businessBlockedRanges: businessBlocked,
      businessUnblockedRanges: businessUnblocked,
      memberBlockedRangesByMember: byMemberBlocked,
      memberUnblockedRangesByMember: byMemberUnblocked,
      scheduleBlocksThatDay: blocksThatDay,
    };
  }, [selectedDate, blocksVersion]);

  const isDayFullyBlocked = rangesCoverFullDay(businessBlockedRanges);
  const isDayFullyUnblocked = rangesCoverFullDay(businessUnblockedRanges);
  const hasBusinessUnblocks = businessUnblockedRanges.length > 0;
  const hasAnyMemberUnblocks = useMemo(
    () => Object.values(memberUnblockedRangesByMember).some((ranges) => ranges.length > 0),
    [memberUnblockedRangesByMember],
  );

  /* Día sin ningún tramo de apertura (ej. domingo cerrado): si no hay desbloqueos del negocio ni de miembros,
     se muestra "Día libre". */
  const isFullyClosed =
    businessRanges !== undefined &&
    businessRanges.length === 0 &&
    !isDayFullyUnblocked &&
    !hasBusinessUnblocks &&
    !hasAnyMemberUnblocks;

  /* Tramos efectivos de apertura del negocio (horario base + desbloqueos de negocio y de miembros fundidos en bloques continuos). */
  const effectiveBusinessRanges = useMemo(() => {
    const raw = [...(businessRanges ?? []), ...businessUnblockedRanges];
    for (const memberRanges of Object.values(memberUnblockedRangesByMember)) {
      raw.push(...memberRanges);
    }
    if (raw.length === 0) return [];

    const segments = raw
      .map((range) => [timeToSlotIndex(range.startTime), timeToSlotIndex(range.endTime)] as const)
      .sort((a, b) => a[0] - b[0]);

    const merged: { startSlot: number; endSlot: number }[] = [];
    let current = { startSlot: segments[0][0], endSlot: segments[0][1] };

    for (let i = 1; i < segments.length; i++) {
      const [start, end] = segments[i];
      if (start <= current.endSlot) {
        current.endSlot = Math.max(current.endSlot, end);
      } else {
        merged.push(current);
        current = { startSlot: start, endSlot: end };
      }
    }
    merged.push(current);

    return merged;
  }, [businessRanges, businessUnblockedRanges, memberUnblockedRangesByMember]);

  /* Ventana visible del Schedule: desde el colchón antes de la apertura más
     temprana hasta el colchón después del cierre más tardío de ese día (incluyendo desbloqueos). */
  const { windowStartSlot, windowEndSlot } = useMemo(() => {
    const base = effectiveBusinessRanges.length === 0
      ? { windowStartSlot: 0, windowEndSlot: 24 * 4 }
      : (() => {
          const starts = effectiveBusinessRanges.map((range) => range.startSlot);
          const ends = effectiveBusinessRanges.map((range) => range.endSlot);
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
  }, [effectiveBusinessRanges, scrollHeightPx, headerHeightPx, rowHeightPx]);

  /* Al montar (o al llegar un nuevo scrollToTime), posiciona el scroll en la fila del turno recién creado. */
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
    void appointmentsVersion;
    return getAppointmentsByDate(selectedDate);
  }, [selectedDate, appointmentsVersion]);
  const appointmentMap = useMemo(() => buildAppointmentMap(appointments), [appointments]);
  const now = new Date();

  /* Horarios de trabajo de cada miembro, por día. */
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
      memberBlockedRanges: memberBlockedRangesByMember[member],
      businessUnblockedRanges,
      memberUnblockedRanges: memberUnblockedRangesByMember[member],
    });

  const isRowBlockable = (row: number): boolean =>
    computeAvailabilityFor('', row) === 'available';

  const isMemberDayBlockable = (member: string): boolean => {
    const memberRanges = memberRangesByDay[member]?.[selectedDate.getDay()];
    if (!memberRanges || memberRanges.length === 0) return false;

    return !memberBlockedRangesByMember[member]?.length;
  };

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
     marcarlos con un recuadro punteado sin depender del hover. */
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
      businessBlockedRanges,
      memberBlockedRangesByMember,
      businessUnblockedRanges,
      memberUnblockedRangesByMember,
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
    businessBlockedRanges,
    memberBlockedRangesByMember,
    businessUnblockedRanges,
    memberUnblockedRangesByMember,
  ]);

  /* Al elegir (o cambiar) el servicio en el flujo "Agregar turno", hace
     scroll hasta el primer turno disponible. */
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

    const target = Math.max(
      (firstStart - windowStartSlot) * rowHeightPx - 160,
      0,
    );
    scrollRef.current.scrollTop = target;
  }, [pendingSlot, previewServiceInfo, availablePreviewRegions, windowStartSlot, rowHeightPx]);

  const dateStr = useMemo(() => toDateStr(selectedDate), [selectedDate]);

  const handleCellClick = (member: string, row: number) => {
    const startTime = minutesToTime(row * SLOT_DURATION_MINUTES);
    const endTime = minutesToTime(row * SLOT_DURATION_MINUTES + SLOT_DURATION_MINUTES);
    const isAvailable = computeAvailabilityFor(member, row) === 'available';

    const result = toggleCellBlockState({
      dateStr,
      member,
      startTime,
      endTime,
      isAvailable,
    });

    if (!result.success && result.message) {
      onNoticeMessage?.(result.message);
    } else {
      onBlocksVersionChange?.();
    }
  };

  const handleRowClick = (row: number) => {
    const rowStartTime = minutesToTime(row * SLOT_DURATION_MINUTES);
    const rowEndTime = minutesToTime(row * SLOT_DURATION_MINUTES + SLOT_DURATION_MINUTES);
    const isRowOpen = isRowBlockable(row);

    const result = toggleRowBlockState({
      dateStr,
      startTime: rowStartTime,
      endTime: rowEndTime,
      isRowOpen,
    });

    if (!result.success && result.message) {
      onNoticeMessage?.(result.message);
    } else {
      onBlocksVersionChange?.();
    }
  };

  const handleMemberHeaderClick = (member: string) => {
    const isMemberDayOpen = isMemberDayBlockable(member);

    const result = toggleMemberDayBlockState({
      dateStr,
      member,
      isMemberDayOpen,
      now: new Date(),
    });

    if (!result.success && result.message) {
      onNoticeMessage?.(result.message);
    } else {
      onBlocksVersionChange?.();
    }
  };

  const isCompactSchedule = scrollWidthPx > 0 && scrollWidthPx < SCHEDULE_COMPACT_WIDTH_PX;
  const labelColumnWidthPx = isCompactSchedule ? LABEL_COLUMN_COMPACT_WIDTH_PX : LABEL_COLUMN_WIDTH_PX;
  const labelCellClassName = twMerge(
    SCHEDULE_LABEL_CELL_CLASS,
    isCompactSchedule && SCHEDULE_LABEL_CELL_COMPACT_CLASS,
  );
  const labelTextClassName = twMerge(
    SCHEDULE_LABEL_TEXT_CLASS,
    isCompactSchedule && SCHEDULE_LABEL_TEXT_COMPACT_CLASS,
  );

  /* Columna fija de etiquetas de hora */
  const labelColumn: TableColumn<string> = {
    key: 'label',
    header: <span className={SCHEDULE_LABEL_HEADER_CLASS}>Horas</span>,
    width: `${labelColumnWidthPx}px`,
    cellClassName: labelCellClassName,
    cell: (slot, index) => {
      const absoluteIndex = windowStartSlot + index;
      const labelContent =
        index === 0 ? '' : absoluteIndex % 4 === 0 ? <span className={labelTextClassName}>{slot}</span> : '';

      if (!blockModeOpen) {
        return labelContent;
      }

      const isRowOpen = isRowBlockable(absoluteIndex);
      const rowStartTime = minutesToTime(absoluteIndex * SLOT_DURATION_MINUTES);
      const rowEndTime = minutesToTime(absoluteIndex * SLOT_DURATION_MINUTES + SLOT_DURATION_MINUTES);

      return (
        <>
          {labelContent}
          <button
            type="button"
            onClick={() => handleRowClick(absoluteIndex)}
            onMouseEnter={() => setHoveredRowSlot(absoluteIndex)}
            onMouseLeave={() => setHoveredRowSlot((curr) => (curr === absoluteIndex ? null : curr))}
            aria-label={`${isRowOpen ? 'Bloquear' : 'Desbloquear'} horario ${rowStartTime} del negocio`}
            title={`${isRowOpen ? 'Bloquear' : 'Desbloquear'} ${rowStartTime} a ${rowEndTime} para todo el negocio`}
            className={twMerge(
              SCHEDULE_BLOCK_CELL_TARGET_CLASS,
              'cursor-pointer',
              isRowOpen ? 'hover:bg-destructive/30' : 'hover:bg-(--palette-01)/40',
            )}
            style={{ height: `${rowHeightPx - 4}px`, top: '2px' }}
          />
        </>
      );
    },
  };

  /* Cuántas columnas de miembro entran en el ancho real medido (ver el
     ResizeObserver de scrollWidthPx más arriba) — 0 todavía sin medir
     significa "no recortar nada" (se muestran todos los que llegaron por
     props), para no parpadear a 1 columna en el primer render antes de que
     el layout se asiente. Misma "lógica responsive" que DaySelectorButtons
     (ocultar por falta de espacio), pero con cantidad de columnas en vez de
     cantidad de botones. */
  const visibleColumnCount = scrollWidthPx > 0
    ? Math.max(1, Math.floor((scrollWidthPx - labelColumnWidthPx) / MIN_MEMBER_COLUMN_WIDTH_PX))
    : members.length;

  /* Reporta el cupo hacia arriba (useTeamFilters, vía Dashboard) para que
     "Equipo" sepa cuántos miembros puede tener tildados a la vez — y, si
     alguien tilda uno de más, destilde otro solo para hacer lugar. */
  useEffect(() => {
    if (scrollWidthPx <= 0) return;
    onColumnCapacityChange?.(visibleColumnCount);
  }, [visibleColumnCount, scrollWidthPx, onColumnCapacityChange]);

  /* Corte puramente visual — a propósito no toca `members`/el estado
     "tildado" de Equipo (ver useTeamFilters.ts): si sólo entran los
     primeros N, son los que se renderizan como columna, pero el resto
     sigue "elegido" aunque no se vea ahora mismo. Así, si el ancho vuelve a
     crecer (se agranda la ventana, se cierra un panel de la sidebar),
     `visibleColumnCount` sube solo y las columnas que habían desaparecido
     reaparecen sin que nadie tenga que volver a tildarlas en Equipo. */
  const visibleMembers = scrollWidthPx > 0 ? members.slice(0, visibleColumnCount) : members;

  /* Una columna por cada miembro seleccionado (y visible, ver visibleMembers
     arriba). Si no hay ninguno, o si el día está cerrado (no tiene sentido
     mostrar columnas de miembros para un día sin horario), se usa una
     columna vacía sin bordes para mantener el layout. */
  const isEmpty = members.length === 0;

  const showBlankGrid = isEmpty || isFullyClosed || isDayFullyBlocked;

  const memberColumns: TableColumn<string>[] = showBlankGrid
    ? [{ key: 'empty', header: null, cell: () => null }]
    : visibleMembers.map((member) => {
        const teamFilter = teamFilters?.find((filter) => filter.label === member);
        const memberHeader = (
          <span className={SCHEDULE_MEMBER_HEADER_CLASS}>
            <Image src={memberPhotoMap[member]} name={member} className={SCHEDULE_MEMBER_IMAGE_CLASS} />
            {member}
          </span>
        );

        const isMemberDayOpen = isMemberDayBlockable(member);

        /* Todas las tarjetas de bloqueo de esta columna (bloqueos explícitos + horas no disponibles/no laborales) */
        const columnBlockedCards = computeColumnBlockedCards(
          member,
          windowStartSlot,
          windowEndSlot,
          businessBlockedRanges,
          memberBlockedRangesByMember[member],
          scheduleBlocksThatDay,
          (row) => computeAvailabilityFor(member, row),
          appointmentMap,
        );

        /* Contenido normal de la celda */
        const renderCellContent = (rowIndex: number) => {
          const absoluteRow = windowStartSlot + rowIndex;
          const memberMap = appointmentMap.get(member);

          const computeAvailability = (row: number): CellAvailability => computeAvailabilityFor(member, row);

          const entry = memberMap?.get(absoluteRow);
          if (!entry) {
            if (isRowCoveredByExistingAppointment(absoluteRow, member, appointmentMap)) return null;

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

            if (availability === 'blocked') {
              if (isRowCoveredByBlockedCard(absoluteRow, columnBlockedCards)) {
                return null;
              }

              const blockedCard = columnBlockedCards.find((card) => card.startSlot === absoluteRow);
              if (!blockedCard) return null;

              return (
                <BlockedSlotCard
                  spanSlots={blockedCard.endSlot - blockedCard.startSlot}
                  rowHeightPx={rowHeightPx}
                  onClick={blockedCard.block && onBlockClick ? () => onBlockClick(blockedCard.block!) : undefined}
                />
              );
            }
            if (availability === 'past') return null;

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

        const headerElement = blockModeOpen ? (
          <button
            type="button"
            onClick={() => handleMemberHeaderClick(member)}
            onMouseEnter={() => setHoveredMemberColumn(member)}
            onMouseLeave={() => setHoveredMemberColumn((curr) => (curr === member ? null : curr))}
            aria-label={`${isMemberDayOpen ? 'Bloquear' : 'Desbloquear'} día completo de ${member}`}
            title={`${isMemberDayOpen ? 'Bloquear' : 'Desbloquear'} día completo de ${member}`}
            className={twMerge(
              'flex h-10 w-full items-center justify-center rounded-3xl px-2 cursor-pointer transition-colors',
              isMemberDayOpen ? 'hover:bg-destructive/25' : 'hover:bg-(--palette-01)/30',
            )}
          >
            {memberHeader}
          </button>
        ) : (
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
        );

        return {
          key: `member-${member}`,
          header: headerElement,
          cellClassName: (_slot: string, rowIndex: number) => {
            void rowIndex;
            return SCHEDULE_SLOT_CELL_CLASS;
          },
          cell: (_slot: string, rowIndex: number) => {
            const normalContent = renderCellContent(rowIndex);
            const absoluteRow = windowStartSlot + rowIndex;

            if (blockModeOpen) {
              const isCellAvailable = computeAvailabilityFor(member, absoluteRow) === 'available';
              const cellStartTime = minutesToTime(absoluteRow * SLOT_DURATION_MINUTES);
              const cellEndTime = minutesToTime(absoluteRow * SLOT_DURATION_MINUTES + SLOT_DURATION_MINUTES);
              const isRowHovered = hoveredRowSlot === absoluteRow;
              const isRowOpen = isRowBlockable(absoluteRow);
              const isMemberColumnHovered = hoveredMemberColumn === member;
              const visibleRowsCount = windowEndSlot - windowStartSlot;

              return (
                <>
                  {normalContent}
                  {isRowHovered && (
                    <span
                      className={twMerge(
                        'absolute inset-x-1 rounded-3xl pointer-events-none',
                        isRowOpen ? 'bg-destructive/25' : 'bg-(--palette-01)/35',
                      )}
                      style={{ height: `${rowHeightPx - 4}px`, top: '2px' }}
                    />
                  )}
                  {isMemberColumnHovered && (
                    <span
                      className={twMerge(
                        'absolute inset-x-1 top-0 bottom-0 pointer-events-none',
                        rowIndex === 0 && 'rounded-t-3xl',
                        rowIndex === visibleRowsCount - 1 && 'rounded-b-3xl',
                        isMemberDayOpen ? 'bg-destructive/20' : 'bg-(--palette-01)/30',
                      )}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleCellClick(member, absoluteRow)}
                    aria-label={`${isCellAvailable ? 'Bloquear' : 'Desbloquear'} horario ${cellStartTime} de ${member}`}
                    title={`${isCellAvailable ? 'Bloquear' : 'Desbloquear'} ${cellStartTime} a ${cellEndTime} (${member})`}
                    className={twMerge(
                      SCHEDULE_BLOCK_CELL_TARGET_CLASS,
                      'cursor-pointer',
                      isCellAvailable
                        ? SCHEDULE_BLOCK_CELL_HOVER_CLASS
                        : SCHEDULE_UNBLOCK_CELL_HOVER_CLASS,
                    )}
                    style={{ height: `${rowHeightPx - 4}px`, top: '2px' }}
                  />
                </>
              );
            }

            return normalContent;
          },
        };
      });

  const columns: TableColumn<string>[] = [labelColumn, ...memberColumns];

  /* "Día libre"/"Día bloqueado" pisan el aviso de "sin miembros
     seleccionados": describen mejor la situación cuando, además, ese día
     el negocio no abre o está bloqueado entero. */
  const emptyMessage = isFullyClosed
    ? 'Día libre'
    : isDayFullyBlocked
      ? 'Día bloqueado'
      : isEmpty
        ? 'No hay miembros del equipo seleccionados'
        : null;

  return (
    <Box className={twMerge(SCHEDULE_CLASS, className)}>
      <ScheduleControls
        rowHeightPx={rowHeightPx}
        onRowHeightChange={setRowHeightPx}
        onAddShift={() => onOpenAddShift?.()}
        addShiftOpen={addShiftOpen}
        onCloseAddShift={onCloseAddShift}
        blockModeOpen={blockModeOpen}
        onToggleBlockMode={onToggleBlockMode}
        onSaveBlockMode={onSaveBlockMode}
        onCancelBlockMode={onCancelBlockMode}
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
              labelColumnWidthPx={labelColumnWidthPx}
            />
          )}
        </div>
      </div>
      {emptyMessage && (
        <div className={twMerge(SCHEDULE_EMPTY_CLASS, 'flex flex-col gap-3')}>
          <span className="pointer-events-none">{emptyMessage}</span>
          {isDayFullyBlocked && (
            <button
              type="button"
              onClick={() => {
                const matchingBusinessBlock = scheduleBlocksThatDay.find((block) => !block.member);
                if (matchingBusinessBlock && onBlockClick) {
                  onBlockClick(matchingBusinessBlock);
                }
              }}
              className="pointer-events-auto cursor-pointer rounded-3xl border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all duration-150"
            >
              Detalles
            </button>
          )}
        </div>
      )}
    </Box>
  );
}
