/*
  src/functions/scheduleCellAvailability.ts
  Fuente única de verdad para decidir el estado de una celda del Schedule:

    - "past"     → tiempo pasado (día anterior o slot ya finalizado hoy).
    - "blocked"  → no se puede reservar: el miembro no realiza el servicio
                   seleccionado, la celda cae fuera del horario del negocio
                   (día cerrado = todo bloqueado), o cae dentro de un
                   ScheduleBlock — de todo el negocio o de este miembro
                   puntual ("Crear un nuevo bloqueo").
    - "available"→ se puede agregar un turno.

  El orden de prioridad es: miembro no calificado > pasado > fuera de horario
  > bloqueo puntual (negocio o miembro).
*/

import { isSameDay } from '@/utils/dateName';
import { getScheduleBlocksByDate, getTeamMembers } from '@/database/data';
import { isSlotWithinBusinessHours, rangesCoverFullDay, type TimeRange } from '@/hooks/useWeekSchedule';

export type CellAvailability = 'available' | 'past' | 'blocked';

/** Ancho de cada slot del Schedule, en minutos (debe coincidir con
    timeToSlotIndex/la cantidad de filas en Schedule.tsx: 24h * 4 = 96). */
const SLOT_DURATION_MINUTES = 15;

export interface CellAvailabilityInput {
  /** Día que se está viendo en el Schedule. */
  selectedDate: Date;
  /** "Ahora" usado para comparar (permite inyectar reloj en tests). */
  now: Date;
  /** Minutos desde 00:00 del slot (rowIndex * 15). */
  slotMinutes: number;
  /** Tramos de apertura del negocio ese día; undefined = sin restricción, [] = cerrado. */
  businessRanges?: TimeRange[];
  /** Tramos de trabajo del empleado ese día; undefined = sin restricción, [] = no trabaja. */
  memberRanges?: TimeRange[];
  /** Nombre del miembro de la columna. */
  member: string;
  /** Columnas bloqueadas por no realizar el servicio seleccionado. */
  blockedMembers?: string[];
  /** Tramos bloqueados a mano para todo el negocio ese día (ScheduleBlock
      sin `member`), ya resueltos por el caller — ver
      businessBlockedRanges en Schedule.tsx. */
  businessBlockedRanges?: TimeRange[];
  /** Tramos bloqueados a mano para ESTE miembro puntual ese día
      (ScheduleBlock con `member` igual al de esta columna) — ver
      "Bloquear día de un miembro". */
  memberBlockedRanges?: TimeRange[];
  /** Tramos desbloqueados a mano para todo el negocio ese día (ScheduleBlock
      con type === 'unblock' sin `member`). */
  businessUnblockedRanges?: TimeRange[];
  /** Tramos desbloqueados a mano para ESTE miembro puntual ese día
      (ScheduleBlock con type === 'unblock' y `member`). */
  memberUnblockedRanges?: TimeRange[];
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Verdadero si el slot [slotMinutes, slotMinutes + durationMinutes) se
    superpone con alguno de los rangos bloqueados o desbloqueados. */
export function slotOverlapsRanges(slotMinutes: number, durationMinutes: number, ranges: TimeRange[]): boolean {
  const slotEnd = slotMinutes + durationMinutes;
  return ranges.some(
    (range) => slotMinutes < timeToMinutes(range.endTime) && slotEnd > timeToMinutes(range.startTime),
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Solo es pasado si el slot terminó por completo; el slot en curso (sobre el
    que está la línea horaria) sigue siendo reservable. */
export function isPastSlot(selectedDate: Date, slotMinutes: number, now: Date): boolean {
  if (selectedDate < startOfDay(now)) {
    return true;
  }

  if (isSameDay(selectedDate, now)) {
    const minutesElapsed = now.getHours() * 60 + now.getMinutes();
    return slotMinutes + 15 <= minutesElapsed;
  }

  return false;
}

export function getCellAvailability({
  selectedDate,
  now,
  slotMinutes,
  businessRanges,
  memberRanges,
  member,
  blockedMembers,
  businessBlockedRanges,
  memberBlockedRanges,
  businessUnblockedRanges,
  memberUnblockedRanges,
}: CellAvailabilityInput): CellAvailability {
  if (blockedMembers?.includes(member)) {
    return 'blocked';
  }

  if (isPastSlot(selectedDate, slotMinutes, now)) {
    return 'past';
  }

  if (businessBlockedRanges?.length && slotOverlapsRanges(slotMinutes, SLOT_DURATION_MINUTES, businessBlockedRanges)) {
    return 'blocked';
  }

  if (memberBlockedRanges?.length && slotOverlapsRanges(slotMinutes, SLOT_DURATION_MINUTES, memberBlockedRanges)) {
    return 'blocked';
  }

  const isBusinessUnblocked = businessUnblockedRanges?.length
    ? slotOverlapsRanges(slotMinutes, SLOT_DURATION_MINUTES, businessUnblockedRanges)
    : false;
  const isMemberUnblocked = memberUnblockedRanges?.length
    ? slotOverlapsRanges(slotMinutes, SLOT_DURATION_MINUTES, memberUnblockedRanges)
    : false;

  const isWithinMemberHours = isSlotWithinBusinessHours(slotMinutes, SLOT_DURATION_MINUTES, memberRanges);
  if (!isWithinMemberHours && !isMemberUnblocked && !isBusinessUnblocked) {
    return 'blocked';
  }

  const isWithinBusinessHours = isSlotWithinBusinessHours(slotMinutes, SLOT_DURATION_MINUTES, businessRanges);
  if (!isWithinBusinessHours && !isBusinessUnblocked && !isMemberUnblocked) {
    return 'blocked';
  }

  return 'available';
}

/** Verdadero si hay uno o más ScheduleBlock de todo el negocio (sin
    `member` y type !== 'unblock') que, fundidos entre sí, cubren esa fecha entera —
    "Bloquear día del negocio", o el resultado de bloquear a mano cada
    hora hasta completar el día. Se usa para apagar esos días en
    Calendar/DaySelectorButtons, igual que un día sin horario de
    atención.
    Si hay cualquier desbloqueo de negocio ese día (parcial o total), no se
    considera bloqueado (el desbloqueo abre el día aunque sea parcialmente). */
export function isBusinessDayFullyBlocked(date: Date): boolean {
  const blocks = getScheduleBlocksByDate(date).filter((block) => !block.member);
  const unblocks = blocks.filter((block) => block.type === 'unblock');
  // Cualquier desbloqueo de negocio ese día deja de considerarse "día bloqueado"
  if (unblocks.length > 0) {
    return false;
  }

  const businessRanges = blocks
    .filter((block) => block.type !== 'unblock')
    .map((block) => ({ startTime: block.startTime, endTime: block.endTime }));

  return rangesCoverFullDay(businessRanges);
}

/** Verdadero si hay un desbloqueo que cubre el día completo del negocio (00:00-24:00). */
export function isBusinessDayFullyUnblocked(date: Date): boolean {
  const unblocks = getScheduleBlocksByDate(date)
    .filter((block) => !block.member && block.type === 'unblock')
    .map((block) => ({ startTime: block.startTime, endTime: block.endTime }));

  return rangesCoverFullDay(unblocks);
}

/** Verdadero si hay al menos un desbloqueo de negocio ese día (parcial o total). */
export function isBusinessDayAnyUnblocked(date: Date): boolean {
  return getScheduleBlocksByDate(date).some((block) => !block.member && block.type === 'unblock');
}

/** Nombres de los miembros que NO tienen marcado el servicio seleccionado
    (sus columnas quedan bloqueadas en el flujo "Agregar turno"). */
export function getBlockedMemberNames(selectedService?: string | null): string[] {
  if (!selectedService) {
    return [];
  }

  const wanted = selectedService.toLowerCase();

  return getTeamMembers()
    .filter((member) => !member.services.some((name) => name.toLowerCase() === wanted))
    .map((member) => member.name);
}