/* 
  src/components/widgets/Schedule.tsx
  Vista diaria de la agenda, organizada por bloques horarios representados con una tabla.
  Estructura: 1 columna fija de horas (invariable) + X columnas de contenido,
  donde X es la cantidad de miembros del equipo seleccionados.
*/

import { useLayoutEffect, useMemo, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from '@/components/ui/box';
import Image from '@/components/ui/image';
import { Table, type TableColumn } from '@/components/ui/table';
import CurrentTimeLine from '@/components/ui/current-time-line';
import { getAppointmentsByDate, getOpeningHours, getservices, getTeamMembers } from '@/database/data';
import type { Appointment } from '@/database/types';
import type { ShiftSlot } from '@/pages/admin/Dashboard';
import { getBusinessHoursByDay, minutesToTime, type TimeRange } from '@/hooks/useWeekSchedule';
import { getCellAvailability, type CellAvailability } from '@/functions/scheduleCellAvailability';
import { SERVICE_COLOR_BY_ID } from '@/components/widgets/serviceWidgets/serviceColors';
import AppointmentCard from './AppointmentCard';
import BlockedCell from './BlockedCell';

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
}

const SCHEDULE_CLASS = 'relative flex flex-col flex-1 p-0 overflow-hidden rounded-b-3xl bg-card';

const SCHEDULE_SCROLL_CLASS = 'flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

const SCHEDULE_CONTENT_CLASS = 'relative';

const SCHEDULE_TABLE_CLASS = '';

const SCHEDULE_TABLE_HEADER_CLASS = 'bg-card';

const SCHEDULE_ROW_HEIGHT_CLASS = 'h-12';

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
const SCHEDULE_AVAILABLE_SLOT_CLASS = 'absolute inset-x-1 z-10 rounded-3xl border border-dashed border-white pointer-events-none';

/* Turno elegido en el Schedule, a la espera de que se confirme el cliente:
   misma tarjeta que la preview pero fija (no depende del hover) y con un
   anillo que la distingue de un turno ya confirmado. */
const SCHEDULE_PENDING_CARD_CLASS = 'ring-2 ring-foreground/70 ring-offset-1 ring-offset-card cursor-default';

const SLOT_DURATION_MINUTES = 15;

/* Alto de cada fila del Schedule (h-12). Se usa para calcular el scroll a la
   fila del turno recién creado. */
const SCHEDULE_ROW_HEIGHT_PX = 48;

/* Colchón que se muestra antes/después del horario real de apertura del
   negocio (2 horas = 8 slots de 15 min), para que la grilla no arranque
   justo en el horario de apertura. */
const BUSINESS_HOURS_PADDING_SLOTS = (2 * 60) / SLOT_DURATION_MINUTES;

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

interface EarliestBookableRowParams {
  members: string[];
  blockedMembers?: string[];
  spanSlots: number;
  selectedDate: Date;
  now: Date;
  businessRanges?: TimeRange[];
  memberRangesByDay: Record<string, Record<number, TimeRange[]>>;
  appointmentMap: Map<string, Map<number, { appointment: Appointment; spanSlots: number }>>;
  /** Ventana visible del Schedule (horario real ± colchón): acota la búsqueda
      a filas que efectivamente se renderizan. */
  windowStartSlot: number;
  windowEndSlot: number;
}

/** Primera fila (0-95) en la que algún miembro no bloqueado puede arrancar un
    turno de `spanSlots`, o null si no entra en ningún lado ese día. Se usa
    para llevar el scroll de Schedule al primer horario libre apenas se
    elige un servicio en el flujo "Agregar turno". */
function findEarliestBookableRow({
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
}: EarliestBookableRowParams): number | null {
  const eligibleMembers = members.filter((member) => !blockedMembers?.includes(member));
  if (eligibleMembers.length === 0) return null;

  const checkAvailability = (member: string, row: number): CellAvailability =>
    getCellAvailability({
      selectedDate,
      now,
      slotMinutes: row * SLOT_DURATION_MINUTES,
      businessRanges,
      memberRanges: memberRangesByDay[member]?.[selectedDate.getDay()],
      member,
      blockedMembers,
    });

  const isRowFree = (member: string, row: number): boolean => {
    const memberAppointments = appointmentMap.get(member);
    if (memberAppointments?.has(row)) return false;
    if (isRowCoveredByExistingAppointment(row, member, appointmentMap)) return false;
    if (checkAvailability(member, row) !== 'available') return false;
    return isSpanBookable(row, spanSlots, member, appointmentMap, (r) => checkAvailability(member, r));
  };

  for (let row = windowStartSlot; row < windowEndSlot; row++) {
    if (eligibleMembers.some((member) => isRowFree(member, row))) {
      return row;
    }
  }

  return null;
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
}: ScheduleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
     se muestra el día completo. */
  const { windowStartSlot, windowEndSlot } = useMemo(() => {
    if (!businessRanges || businessRanges.length === 0) {
      return { windowStartSlot: 0, windowEndSlot: 24 * 4 };
    }

    const starts = businessRanges.map((range) => timeToSlotIndex(range.startTime));
    const ends = businessRanges.map((range) => timeToSlotIndex(range.endTime));

    return {
      windowStartSlot: Math.max(0, Math.min(...starts) - BUSINESS_HOURS_PADDING_SLOTS),
      windowEndSlot: Math.min(24 * 4, Math.max(...ends) + BUSINESS_HOURS_PADDING_SLOTS),
    };
  }, [businessRanges]);

  /* Al montar (o al llegar un nuevo scrollToTime), posiciona el scroll en la
     fila del turno recién creado: queda en el 25% superior de la vista para
     mostrar el turno y algo de contexto por arriba/abajo. */
  useLayoutEffect(() => {
    if (!scrollToTime || !scrollRef.current) return;

    const rowIndex = timeToSlotIndex(scrollToTime);
    const target = Math.max(
      (rowIndex - windowStartSlot) * SCHEDULE_ROW_HEIGHT_PX - scrollRef.current.clientHeight * 0.25,
      0,
    );
    scrollRef.current.scrollTop = target;
    onScrollConsumed?.();
  }, [scrollToTime, onScrollConsumed, windowStartSlot]);

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
     scroll al primer horario libre en el que ese servicio entra completo
     para alguno de los miembros habilitados — así no hay que buscarlo a
     mano en la grilla. */
  useLayoutEffect(() => {
    if (!previewServiceInfo || !scrollRef.current) return;

    const earliestRow = findEarliestBookableRow({
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
    if (earliestRow === null) return;

    const target = Math.max(
      (earliestRow - windowStartSlot) * SCHEDULE_ROW_HEIGHT_PX - scrollRef.current.clientHeight * 0.25,
      0,
    );
    scrollRef.current.scrollTop = target;
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

  const dateStr = useMemo(() => toDateStr(selectedDate), [selectedDate]);

  /* Columna fija de etiquetas de hora: width explícito para que table-fixed no la incluya
     en el reparto equitativo — las columnas de miembros se dividen el espacio sobrante. */
  const labelColumn: TableColumn<string> = {
    key: 'label',
    header: <span className={SCHEDULE_LABEL_HEADER_CLASS}>Horas</span>,
    width: '64px',
    cellClassName: SCHEDULE_LABEL_CELL_CLASS,
    cell: (slot, index) => {
      if (index === 0) return '';
      const absoluteIndex = windowStartSlot + index;
      return absoluteIndex % 4 === 0 ? <span className={SCHEDULE_LABEL_TEXT_CLASS}>{slot}</span> : '';
    },
  };

  /* Una columna por cada miembro seleccionado. Si no hay ninguno,
     se usa una columna vacía sin bordes para mantener el layout. */
  const isEmpty = members.length === 0;

  const memberColumns: TableColumn<string>[] = isEmpty
    ? [{ key: 'empty', header: null, cell: () => null }]
    : members.map((member) => ({
        key: `member-${member}`,
        header: (
          <span className={SCHEDULE_MEMBER_HEADER_CLASS}>
            <Image src={memberPhotoMap[member]} name={member} className={SCHEDULE_MEMBER_IMAGE_CLASS} />
            {member}
          </span>
        ),
        cellClassName: SCHEDULE_SLOT_CELL_CLASS,
        cell: (_slot: string, rowIndex: number) => {
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
                    colorClassName={previewServiceInfo.colorClassName}
                    servicePhoto={previewServiceInfo.photo}
                    className={SCHEDULE_PENDING_CARD_CLASS}
                  />
                );
              }

              return null;
            }

            const availability = computeAvailability(absoluteRow);

            if (availability === 'blocked' || availability === 'past') return <BlockedCell />;
            if (!previewServiceInfo) return null;

            if (previewServiceInfo) {
              const heightPx = previewServiceInfo.spanSlots * 48 - 4;
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
                      style={{ height: `${regionLength * 48 - 4}px`, top: '2px' }}
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

          return (
            <AppointmentCard
              appointment={appointment}
              spanSlots={spanSlots}
              colorClassName={colorClassName}
              servicePhoto={servicePhotoMap[appointment.service]}
              onClick={onAppointmentClick ? () => onAppointmentClick(appointment) : undefined}
            />
          );
        },
      }));

  const columns: TableColumn<string>[] = [labelColumn, ...memberColumns];

  /* "Día libre" pisa el aviso de "sin miembros seleccionados": describe mejor
     la situación cuando, además, ese día el negocio no abre. */
  const emptyMessage = isFullyClosed ? 'Día libre' : isEmpty ? 'No hay miembros del equipo seleccionados' : null;

  return (
    <Box className={twMerge(SCHEDULE_CLASS, className)}>
      <div data-schedule-scroll ref={scrollRef} className={SCHEDULE_SCROLL_CLASS}>
        <div className={SCHEDULE_CONTENT_CLASS}>
          <Table
            columns={columns}
            rows={slots}
            rowHeightClassName={SCHEDULE_ROW_HEIGHT_CLASS}
            className={SCHEDULE_TABLE_CLASS}
            headerClassName={SCHEDULE_TABLE_HEADER_CLASS}
            showHeader
            stickyHeader
          />
          {!isEmpty && (
            <CurrentTimeLine
              selectedDate={selectedDate}
              windowStartSlot={windowStartSlot}
              windowEndSlot={windowEndSlot}
            />
          )}
        </div>
      </div>
      {emptyMessage && <div className={SCHEDULE_EMPTY_CLASS}>{emptyMessage}</div>}
    </Box>
  );
}

