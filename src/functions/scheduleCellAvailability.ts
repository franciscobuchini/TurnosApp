/*
  src/functions/scheduleCellAvailability.ts
  Fuente única de verdad para decidir el estado de una celda del Schedule:

    - "past"     → tiempo pasado (día anterior o slot ya finalizado hoy).
    - "blocked"  → no se puede reservar: el miembro no realiza el servicio
                   seleccionado, la celda cae fuera del horario del negocio
                   (día cerrado = todo bloqueado), o cae dentro de un
                   ScheduleBlock ("Crear un nuevo bloqueo").
    - "available"→ se puede agregar un turno.

  El orden de prioridad es: miembro no calificado > pasado > fuera de horario
  > bloqueo puntual.
*/

import { isSameDay } from '@/utils/dateName';
import { getTeamMembers } from '@/database/data';
import { isSlotWithinBusinessHours, type TimeRange } from '@/hooks/useWeekSchedule';

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
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Verdadero si el slot [slotMinutes, slotMinutes + durationMinutes) se
    superpone con alguno de los rangos bloqueados. */
function slotOverlapsRanges(slotMinutes: number, durationMinutes: number, ranges: TimeRange[]): boolean {
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
function isPastSlot(selectedDate: Date, slotMinutes: number, now: Date): boolean {
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
}: CellAvailabilityInput): CellAvailability {
  if (blockedMembers?.includes(member)) {
    return 'blocked';
  }

  if (isPastSlot(selectedDate, slotMinutes, now)) {
    return 'past';
  }

  if (!isSlotWithinBusinessHours(slotMinutes, SLOT_DURATION_MINUTES, memberRanges)) {
    return 'blocked';
  }

  if (!isSlotWithinBusinessHours(slotMinutes, SLOT_DURATION_MINUTES, businessRanges)) {
    return 'blocked';
  }

  if (businessBlockedRanges?.length && slotOverlapsRanges(slotMinutes, SLOT_DURATION_MINUTES, businessBlockedRanges)) {
    return 'blocked';
  }

  return 'available';
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