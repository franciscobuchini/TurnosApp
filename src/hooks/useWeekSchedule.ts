/*
  src/hooks/useWeekSchedule.ts
  Lógica compartida para trabajar con horarios semanales (lunes a domingo),
  independiente de la UI. La usa WeekSchedule (horarios del trabajador)
  y servirá para otros selectores de horarios (por ejemplo, el horario del
  local, que restringirá los horarios disponibles de los trabajadores).

  Modelo: cada día (dayOfWeek, 0 = Domingo) tiene un flag `works` y una lista
  de turnos (ranges) con startTime/endTime "HH:mm". Se emite como array de
  OpeningHoursEntry evaluado por día: { dayOfWeek, startTime, endTime }.

Validaciones:
  - Dentro de un mismo turno, "desde" siempre debe ser menor a "hasta".
  - Entre los turnos de un mismo día (máximo MAX_RANGES_PER_DAY) los rangos
    no pueden superponerse.
  Un turno inválido queda visible en la UI (con su mensaje de error) pero nunca
  llega al schedule final que se emite vía onChange. Los turnos incompletos
  (sin "desde" o "hasta") no son un error mientras se editan, pero se descartan
  al guardar; si un día queda sin turnos, es un día libre ("No trabaja").
*/

import { useRef, useState } from 'react';
import type { OpeningHoursEntry } from '../database/types';

export const MAX_RANGES_PER_DAY = 2;

export type TimeRange = {
  startTime: string;
  endTime: string;
};

export type DaySchedule = {
  dayOfWeek: number;
  works: boolean;
  ranges: TimeRange[];
};

export type DayRow = {
  dayOfWeek: number;
  label: string;
};

export const DAYS: DayRow[] = [
  { dayOfWeek: 1, label: 'Lunes' },
  { dayOfWeek: 2, label: 'Martes' },
  { dayOfWeek: 3, label: 'Miércoles' },
  { dayOfWeek: 4, label: 'Jueves' },
  { dayOfWeek: 5, label: 'Viernes' },
  { dayOfWeek: 6, label: 'Sábado' },
  { dayOfWeek: 0, label: 'Domingo' },
];

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

const pad = (n: number) => n.toString().padStart(2, '0');

export function minutesToTime(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

// Un rango es válido si, con ambos horarios cargados, "desde" es estrictamente
// menor a "hasta". Un rango incompleto (todavía sin terminar de cargar) no se
// considera inválido para no mostrar error mientras el usuario está eligiendo.
export function isRangeOrderValid(range: TimeRange): boolean {
  if (!range.startTime || !range.endTime) {
    return true;
  }
  return timeToMinutes(range.startTime) < timeToMinutes(range.endTime);
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) {
    return false;
  }
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

// Valida un día entero (todas sus filas de horario) y devuelve una única
// notificación consolidada, para que el error se muestre una sola vez por día,
// debajo de todas las filas y no debajo de cada horario por separado.
export function getDayError(ranges: TimeRange[]): string | null {
  const inverted = new Set<number>();
  const overlapping = new Set<number>();

  ranges.forEach((range, index) => {
    const otherRanges = ranges.filter((_, otherIndex) => otherIndex !== index);
    if (!isRangeOrderValid(range)) {
      inverted.add(index);
    }
    if (otherRanges.some((other) => rangesOverlap(range, other))) {
      overlapping.add(index);
    }
  });

  const affected = new Set<number>([...inverted, ...overlapping]);

  if (inverted.size > 0 && overlapping.size > 0) {
    return 'Hay turnos con horario invertido y turnos superpuestos';
  }
  if (inverted.size > 0) {
    return affected.size === 1
      ? 'El horario "hasta" debe ser posterior al horario "desde"'
      : 'Hay turnos con el horario "hasta" anterior al "desde"';
  }
  if (overlapping.size > 0) {
    return affected.size === 1
      ? 'Este turno se superpone con otro turno del mismo día'
      : 'Hay turnos superpuestos en este día';
  }
  return null;
}

function buildDaysFromValue(value?: OpeningHoursEntry[]): Record<number, DaySchedule> {
  const record = {} as Record<number, DaySchedule>;

  for (const { dayOfWeek } of DAYS) {
    const entries =
      value?.filter((item) => item.dayOfWeek === dayOfWeek && item.startTime && item.endTime) ?? [];
    record[dayOfWeek] = {
      dayOfWeek,
      works: entries.length > 0,
      ranges: entries.map((item) => ({
        startTime: item.startTime as string,
        endTime: item.endTime as string,
      })),
    };
  }

  return record;
}

// Sólo se emiten los turnos completos y válidos (desde < hasta, sin
// superposición). Un turno incompleto (faltando "desde" o "hasta") se descarta
// al guardar: la fila desaparece. Un turno inválido queda visible en la UI (con
// su mensaje de error) pero nunca llega al schedule final. Si un día queda sin
// turnos, es un día libre ("No trabaja") y se guarda explícito como
// { startTime: null, endTime: null } — nunca se omite. Omitirlo lo volvería
// indistinguible de "sin datos para ese día" (getBusinessHoursByDay lee
// ausente = sin restricción, no cerrado), lo que dejaría el día libre sin
// bloquear en el Schedule después de guardar.
function serializeDays(days: Record<number, DaySchedule>): OpeningHoursEntry[] {
  const schedule: OpeningHoursEntry[] = [];

  for (const { dayOfWeek } of DAYS) {
    const day = days[dayOfWeek];

    if (!day.works) {
      schedule.push({ dayOfWeek, startTime: null, endTime: null });
      continue;
    }

    let pushedRange = false;

    day.ranges.forEach((range, index) => {
      if (!range.startTime || !range.endTime) {
        return;
      }
      const otherRanges = day.ranges.filter((_, otherIndex) => otherIndex !== index);
      if (!isRangeOrderValid(range) || otherRanges.some((other) => rangesOverlap(range, other))) {
        return;
      }
      schedule.push({ dayOfWeek, startTime: range.startTime, endTime: range.endTime });
      pushedRange = true;
    });

    // "Trabaja" pero todos los turnos cargados son inválidos/incompletos:
    // sigue sin ser un día cerrado de verdad, así que tampoco se omite.
    if (!pushedRange) {
      schedule.push({ dayOfWeek, startTime: null, endTime: null });
    }
  }

  return schedule;
}

// Recorta un rango de un día a los límites permitidos (por ejemplo, el horario
// del local), devolviendo el rango recortado o null si queda vacío. `limits`
// por día es opcional: un día sin límites no se restringe.
export function clampRangeToLimits(
  range: TimeRange,
  limits?: TimeRange,
): TimeRange | null {
  if (!limits?.startTime || !limits?.endTime) {
    return range;
  }

  const limitStart = timeToMinutes(limits.startTime);
  const limitEnd = timeToMinutes(limits.endTime);

  const from = range.startTime ? timeToMinutes(range.startTime) : limitStart;
  const to = range.endTime ? timeToMinutes(range.endTime) : limitEnd;

  const clampedFrom = Math.max(from, limitStart);
  const clampedTo = Math.min(to, limitEnd);

  if (clampedTo <= clampedFrom) {
    return null;
  }

  const padLocal = (n: number) => n.toString().padStart(2, '0');
  return {
    startTime: `${padLocal(Math.floor(clampedFrom / 60))}:${padLocal(clampedFrom % 60)}`,
    endTime: `${padLocal(Math.floor(clampedTo / 60))}:${padLocal(clampedTo % 60)}`,
  };
}

/* ── Restricciones por horario del local ──────────────────── */

// Devuelve, por día, la lista de tramos en los que el local está
// abierto (OpeningHoursEntry[] → Record<dayOfWeek, TimeRange[]>). Los días
// sin tramos (cerrados) quedan con una lista vacía: se interpretan como día
// entero bloqueado.
export function getBusinessHoursByDay(
  businessHours?: OpeningHoursEntry[],
): Record<number, TimeRange[]> {
  const byDay: Record<number, TimeRange[]> = {};

  for (const entry of businessHours ?? []) {
    // El día se registra siempre (aunque quede vacío) para que un día cerrado
    // se distinga de un día sin datos: [] = cerrado, undefined = sin restricción.
    byDay[entry.dayOfWeek] ??= [];

    if (typeof entry.startTime !== 'string' || typeof entry.endTime !== 'string') {
      continue;
    }
    byDay[entry.dayOfWeek].push({
      startTime: entry.startTime,
      endTime: entry.endTime,
    });
  }

  return byDay;
}

// Verdadero si los rangos, fundidos entre sí, cubren el día completo (00:00
// a 24:00) sin huecos — la forma exacta en que persiste un bloqueo de
// "Bloquear día del negocio" (ver confirmBlock en Dashboard.tsx), y también
// el resultado de bloquear a mano cada slot del día uno por uno hasta
// completarlo. Se usa tanto para el Schedule (mostrar "Día bloqueado") como
// para apagar esos días en Calendar/DaySelectorButtons.
export function rangesCoverFullDay(ranges: TimeRange[]): boolean {
  if (ranges.length === 0) return false;

  const sorted = [...ranges].sort((a, b) => a.startTime.localeCompare(b.startTime));
  if (sorted[0].startTime !== '00:00') return false;

  let cursor = sorted[0].endTime;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startTime > cursor) return false;
    if (sorted[i].endTime > cursor) cursor = sorted[i].endTime;
  }

  return cursor === '24:00';
}

// Verdadero si `totalMinutes` cae dentro de alguno de los tramos en que el
// local está abierto ese día. Límites inclusive: un horario elegido justo en
// la apertura o el cierre es válido (se usa para habilitar/deshabilitar
// opciones puntuales del selector de hora, donde "hasta" = el cierre debe
// poder elegirse). `undefined` (día sin datos) no restringe; una lista vacía
// significa día cerrado y bloquea todos los horarios.
export function isTimeWithinBusinessHours(
  totalMinutes: number,
  businessHours?: TimeRange[],
): boolean {
  if (businessHours === undefined) {
    return true;
  }

  return businessHours.some(
    (hours) =>
      totalMinutes >= timeToMinutes(hours.startTime) &&
      totalMinutes <= timeToMinutes(hours.endTime),
  );
}

// Verdadero si el slot de `durationMinutes` que arranca en `slotMinutes`
// entra completo en alguno de los tramos. A diferencia de
// isTimeWithinBusinessHours, acá el cierre es exclusivo: un slot que arranca
// justo al cierre no es reservable porque no queda tiempo dentro del
// horario (ej. cierre 13:00 → el slot 13:00-13:15 queda bloqueado, el
// 12:45-13:00 no). Se usa para bloquear celdas del Schedule, no para validar
// un horario puntual elegido en el selector.
export function isSlotWithinBusinessHours(
  slotMinutes: number,
  durationMinutes: number,
  businessHours?: TimeRange[],
): boolean {
  if (businessHours === undefined) {
    return true;
  }

  return businessHours.some(
    (hours) =>
      slotMinutes >= timeToMinutes(hours.startTime) &&
      slotMinutes + durationMinutes <= timeToMinutes(hours.endTime),
  );
}

// Límites por día (Record<dayOfWeek, TimeRange>) usados para recortar
// automáticamente los turnos editados: la ventana es desde la apertura más
// temprana hasta el cierre más tardío del día.
export function getBusinessDayLimits(
  businessHours?: OpeningHoursEntry[],
): Record<number, TimeRange> {
  const byDay = getBusinessHoursByDay(businessHours);
  const limits: Record<number, TimeRange> = {};

  for (const dayOfWeek of Object.keys(byDay)) {
    const ranges = byDay[Number(dayOfWeek)];
    if (ranges.length === 0) {
      continue;
    }
    limits[Number(dayOfWeek)] = {
      startTime: ranges.reduce(
        (min, hours) =>
          timeToMinutes(hours.startTime) < timeToMinutes(min.startTime) ? hours : min,
      ).startTime,
      endTime: ranges.reduce(
        (max, hours) =>
          timeToMinutes(hours.endTime) > timeToMinutes(max.endTime) ? hours : max,
      ).endTime,
    };
  }

  return limits;
}

export interface UseWeekScheduleOptions {
  value?: OpeningHoursEntry[];
  onChange?: (schedule: OpeningHoursEntry[]) => void;
  // Límite opcional por día (ej: horario del local). Si un turno queda fuera
  // o se pasaría de largo, se recorta automáticamente al límite.
  limits?: Record<number, TimeRange>;
}

export function useWeekSchedule({ value, onChange, limits }: UseWeekScheduleOptions) {
  const [days, setDays] = useState<Record<number, DaySchedule>>(() => buildDaysFromValue(value));
  const daysRef = useRef(days);

  const setAndEmit = (next: Record<number, DaySchedule>) => {
    daysRef.current = next;
    setDays(next);
    onChange?.(serializeDays(next));
  };

  const updateDay = (dayOfWeek: number, patch: Partial<DaySchedule>) => {
    const current = daysRef.current;
    setAndEmit({
      ...current,
      [dayOfWeek]: { ...current[dayOfWeek], ...patch },
    });
  };

  const toggleWorks = (dayOfWeek: number, works: boolean) => {
    const current = daysRef.current[dayOfWeek];
    updateDay(dayOfWeek, {
      works,
      ranges: works && current.ranges.length === 0 ? [{ startTime: '', endTime: '' }] : current.ranges,
    });
  };

  const addRange = (dayOfWeek: number) => {
    const current = daysRef.current[dayOfWeek];
    if (current.ranges.length >= MAX_RANGES_PER_DAY) {
      return;
    }
    updateDay(dayOfWeek, {
      ranges: [...current.ranges, { startTime: '', endTime: '' }],
    });
  };

  const removeRange = (dayOfWeek: number, index: number) => {
    const current = daysRef.current[dayOfWeek];
    updateDay(dayOfWeek, {
      ranges: current.ranges.filter((_, rangeIndex) => rangeIndex !== index),
    });
  };

  const updateRange = (dayOfWeek: number, index: number, patch: Partial<TimeRange>) => {
    const current = daysRef.current[dayOfWeek];
    const nextRanges = current.ranges.map((range, rangeIndex) =>
      rangeIndex === index ? { ...range, ...patch } : range,
    );

    // Si hay un límite para ese día, recorta el turno editado a los márgenes
    // permitidos. Si queda fuera, se elimina el turno.
    const limit = limits?.[dayOfWeek];
    if (limit) {
      const nextRange = nextRanges[index];
      if (!nextRange.startTime || !nextRange.endTime) {
        nextRanges[index] = {
          startTime: nextRange.startTime,
          endTime: nextRange.endTime,
        };
      } else {
        const clamped = clampRangeToLimits(nextRange, limit);
        if (clamped) {
          nextRanges[index] = clamped;
        } else {
          nextRanges.splice(index, 1);
        }
      }
    }

    updateDay(dayOfWeek, {
      ranges: nextRanges,
    });
  };

  return {
    days,
    toggleWorks,
    addRange,
    removeRange,
    updateRange,
  };
}