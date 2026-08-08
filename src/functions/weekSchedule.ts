/*
  src/functions/weekSchedule.ts
  Lógica compartida para trabajar con horarios semanales (lunes a domingo),
  independiente de la UI. La usa EntityWeekSchedule (horarios del trabajador)
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
// turnos, es un día libre ("No trabaja").
function serializeDays(days: Record<number, DaySchedule>): OpeningHoursEntry[] {
  const schedule: OpeningHoursEntry[] = [];

  for (const { dayOfWeek } of DAYS) {
    const day = days[dayOfWeek];

    if (!day.works) {
      continue;
    }

    day.ranges.forEach((range, index) => {
      if (!range.startTime || !range.endTime) {
        return;
      }
      const otherRanges = day.ranges.filter((_, otherIndex) => otherIndex !== index);
      if (!isRangeOrderValid(range) || otherRanges.some((other) => rangesOverlap(range, other))) {
        return;
      }
      schedule.push({ dayOfWeek, startTime: range.startTime, endTime: range.endTime });
    });
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

  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    startTime: `${pad(Math.floor(clampedFrom / 60))}:${pad(clampedFrom % 60)}`,
    endTime: `${pad(Math.floor(clampedTo / 60))}:${pad(clampedTo % 60)}`,
  };
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