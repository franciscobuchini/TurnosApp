/*
  src/functions/bookingAvailability.ts
  Lógica pura de disponibilidad para el turnero público — hermana de
  scheduleCellAvailability.ts (que resuelve el estado de cada celda de 15min
  del Schedule del admin), pero pensada para slots del tamaño de un servicio:

    horario del negocio ∩ horario del profesional − turnos ya reservados
    = huecos libres → slots candidatos cada 15 min que entran completos.

  Sin UI, sin estado: recibe fecha/servicio/duración y devuelve los slots
  disponibles agregados entre todos los profesionales calificados para el
  servicio. Site/booking la consume; nunca al revés.
*/

import { isSameDay } from '@/utils/dateName';
import { getAppointmentsByDate, getOpeningHours, getScheduleBlocksByDate, getTeamMembers } from '@/database/data';
import { getBusinessHoursByDay, type TimeRange } from '@/hooks/useWeekSchedule';
import type { TeamMember } from '@/database/types';

/** Cuántos días hacia adelante se buscan para el selector de fecha y para el primer día con disponibilidad. */
export const DATE_RANGE_DAYS = 21;

/** Granularidad para proponer horarios de inicio candidatos. */
const SLOT_STEP_MINUTES = 15;

export type AvailableSlot = {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  /** Profesionales calificados que están libres en este horario exacto. */
  memberNames: string[];
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Intersección de dos listas de tramos horarios. */
function intersectRanges(a: TimeRange[], b: TimeRange[]): TimeRange[] {
  const result: TimeRange[] = [];

  for (const rangeA of a) {
    for (const rangeB of b) {
      const start = Math.max(timeToMinutes(rangeA.startTime), timeToMinutes(rangeB.startTime));
      const end = Math.min(timeToMinutes(rangeA.endTime), timeToMinutes(rangeB.endTime));
      if (end > start) {
        result.push({ startTime: minutesToTime(start), endTime: minutesToTime(end) });
      }
    }
  }

  return result;
}

/** Resta una lista de tramos ocupados de una lista de tramos libres. */
function subtractRanges(free: TimeRange[], busy: TimeRange[]): TimeRange[] {
  let result = free;

  for (const busyRange of busy) {
    const busyStart = timeToMinutes(busyRange.startTime);
    const busyEnd = timeToMinutes(busyRange.endTime);
    const next: TimeRange[] = [];

    for (const range of result) {
      const start = timeToMinutes(range.startTime);
      const end = timeToMinutes(range.endTime);

      if (busyEnd <= start || busyStart >= end) {
        next.push(range);
        continue;
      }
      if (busyStart > start) {
        next.push({ startTime: range.startTime, endTime: minutesToTime(busyStart) });
      }
      if (busyEnd < end) {
        next.push({ startTime: minutesToTime(busyEnd), endTime: range.endTime });
      }
    }

    result = next;
  }

  return result;
}

/** Profesionales que realizan el servicio dado. */
export function getQualifiedMembers(serviceName: string): TeamMember[] {
  return getTeamMembers().filter((member) => member.services.includes(serviceName));
}

/**
 * "Cualquiera disponible" (ProfessionalStep): entre los profesionales
 * calificados y libres en el horario elegido, reparte la carga en vez de
 * ofrecerle siempre el primero de la lista al mismo — elige el que menos
 * turnos tenga asignados ese día. Empate (incluida la falta total de
 * turnos, el caso más común) se resuelve al azar entre los empatados.
 */
export function pickAnyAvailableMember(memberNames: string[], date: Date): string {
  const appointmentsThatDay = getAppointmentsByDate(date);
  const countByMember = new Map<string, number>(memberNames.map((name) => [name, 0]));

  for (const appointment of appointmentsThatDay) {
    if (countByMember.has(appointment.member)) {
      countByMember.set(appointment.member, countByMember.get(appointment.member)! + 1);
    }
  }

  const minCount = Math.min(...memberNames.map((name) => countByMember.get(name)!));
  const leastBooked = memberNames.filter((name) => countByMember.get(name) === minCount);

  return leastBooked[Math.floor(Math.random() * leastBooked.length)];
}

/** service.duration se guarda como "45 min" — conversión mínima a minutos. */
export function parseServiceDurationMinutes(duration: string): number {
  const parsed = parseInt(duration, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Slots disponibles para reservar `serviceName` (duración `durationMinutes`)
 * en `date`, agregados entre todos los profesionales calificados. Un slot
 * sólo se ofrece si entra completo dentro de un hueco libre (horario del
 * negocio ∩ horario del profesional, menos sus turnos ya reservados y menos
 * cualquier ScheduleBlock de todo el negocio para ese día — ver "Crear un
 * nuevo bloqueo"). En el día de hoy se descartan los horarios ya pasados.
 */
export function getAvailableSlots(
  date: Date,
  serviceName: string,
  durationMinutes: number,
  now: Date = new Date(),
): AvailableSlot[] {
  if (durationMinutes <= 0) {
    return [];
  }

  const dayOfWeek = date.getDay();
  const businessRanges = getBusinessHoursByDay(getOpeningHours())[dayOfWeek] ?? [];
  if (businessRanges.length === 0) {
    return [];
  }

  const qualifiedMembers = getQualifiedMembers(serviceName);
  if (qualifiedMembers.length === 0) {
    return [];
  }

  const appointmentsThatDay = getAppointmentsByDate(date);
  // Sólo los bloqueos de todo el negocio (sin `member`) afectan acá — un
  // bloqueo puntual de un miembro (todavía no implementado, ver
  // ScheduleBlock en types.ts) restaría sólo de ese profesional.
  const businessBlockedRanges: TimeRange[] = getScheduleBlocksByDate(date)
    .filter((block) => !block.member)
    .map((block) => ({ startTime: block.startTime, endTime: block.endTime }));
  const isToday = isSameDay(date, now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const membersByStart = new Map<number, Set<string>>();

  for (const member of qualifiedMembers) {
    // getTeamMembers() ya normaliza schedule a OpeningHoursEntry[] en runtime;
    // el tipo lo declara más ancho (OpeningHoursEntry[] | string) porque
    // matchea la forma cruda del seed. Guard defensivo, no debería pegar.
    const memberSchedule = Array.isArray(member.schedule) ? member.schedule : [];
    const memberRanges = getBusinessHoursByDay(memberSchedule)[dayOfWeek] ?? [];
    if (memberRanges.length === 0) {
      continue;
    }

    const openRanges = intersectRanges(businessRanges, memberRanges);
    if (openRanges.length === 0) {
      continue;
    }

    const busyRanges = appointmentsThatDay
      .filter((appointment) => appointment.member === member.name)
      .map((appointment) => ({ startTime: appointment.startTime, endTime: appointment.endTime }));

    const freeRanges = subtractRanges(openRanges, [...busyRanges, ...businessBlockedRanges]);

    for (const range of freeRanges) {
      const rangeStart = timeToMinutes(range.startTime);
      const rangeEnd = timeToMinutes(range.endTime);
      const firstSlot = Math.ceil(rangeStart / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;

      for (let slotStart = firstSlot; slotStart + durationMinutes <= rangeEnd; slotStart += SLOT_STEP_MINUTES) {
        if (isToday && slotStart < nowMinutes) {
          continue;
        }
        if (!membersByStart.has(slotStart)) {
          membersByStart.set(slotStart, new Set());
        }
        membersByStart.get(slotStart)!.add(member.name);
      }
    }
  }

  return Array.from(membersByStart.entries())
    .sort(([a], [b]) => a - b)
    .map(([startMinutes, members]) => ({
      startTime: minutesToTime(startMinutes),
      endTime: minutesToTime(startMinutes + durationMinutes),
      memberNames: Array.from(members),
    }));
}

/**
 * Primer día, desde `from` (inclusive) hasta `maxDays` después (por defecto
 * DATE_RANGE_DAYS), en el que `serviceName` tiene al menos un horario
 * reservable de verdad (ver getAvailableSlots) — a diferencia de "el
 * negocio abre ese día", esto también descarta un día donde el negocio
 * abre pero ningún profesional calificado para este servicio tiene un
 * hueco (ya reservado, fuera de su propio horario, etc.). `null` si ningún
 * día del rango tiene disponibilidad (o el servicio no existe / nadie
 * calificado lo hace).
 */
export function getFirstAvailableDate(
  serviceName: string,
  durationMinutes: number,
  from: Date = new Date(),
  maxDays: number = DATE_RANGE_DAYS,
): Date | null {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  for (let offset = 0; offset < maxDays; offset++) {
    const date = new Date(start);
    date.setDate(date.getDate() + offset);
    // OJO: no reenviar `from` acá como `now` — cuando el llamador pasa un
    // `from` sin hora (p.ej. una fecha ya "pisada" a medianoche por un salto
    // anterior), haría que hoy parezca no tener nada pasado todavía y
    // ofrecería horarios ya vencidos. `getAvailableSlots` sin 4° argumento
    // usa la hora real (new Date()), que es lo que corresponde para decidir
    // qué horarios de HOY ya pasaron, sin importar desde qué día se ancló
    // la búsqueda.
    if (getAvailableSlots(date, serviceName, durationMinutes).length > 0) {
      return date;
    }
  }

  return null;
}
