import { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { OpeningHoursEntry } from '../../../database/types';
import Input from '../../interface/Input';
import Checkbox from '../../interface/Checkbox';
import Button from '../../interface/Button';
import Box from '../../interface/Box';
import Table, { type TableColumn } from '../../interface/Table';

/*
  src/components/widgets/entityWidgets/EntityWeekSchedule.tsx
  Selector semanal (lunes a domingo) para elegir los horarios en los que se trabaja.
  Cada día puede tener varios turnos (doble/triple). Se emiten entradas del tipo
  OpeningHoursEntry: { dayOfWeek, startTime, endTime } con dayOfWeek 0 = Domingo.
  Usa Table con 3 columnas (día / checkbox / horario) para que todo quede alineado
  verticalmente entre filas.

  Validaciones de horario:
  - Dentro de un mismo turno, "desde" siempre debe ser menor a "hasta" (no se
    permiten rangos invertidos ni de duración cero).
  - Entre los turnos de un mismo día (máximo 2) los rangos no pueden superponerse.
  Ambas reglas se refuerzan de dos formas: con los atributos nativos min/max de
  los <input type="time"> (guían al usuario mientras elige el horario en el
  picker) y con una validación reactiva que muestra un error en rojo y excluye
  el turno inválido del schedule que se emite hacia el padre (onChange), para
  que nunca se pueda llegar a guardar un horario que no tiene sentido.
*/

export interface EntityWeekScheduleProps {
  value?: OpeningHoursEntry[];
  onChange?: (schedule: OpeningHoursEntry[]) => void;
  readOnly?: boolean;
}

type TimeRange = {
  startTime: string;
  endTime: string;
};

type DaySchedule = {
  dayOfWeek: number;
  works: boolean;
  ranges: TimeRange[];
};

type DayRow = {
  dayOfWeek: number;
  label: string;
};

const DAYS: DayRow[] = [
  { dayOfWeek: 1, label: 'Lunes' },
  { dayOfWeek: 2, label: 'Martes' },
  { dayOfWeek: 3, label: 'Miércoles' },
  { dayOfWeek: 4, label: 'Jueves' },
  { dayOfWeek: 5, label: 'Viernes' },
  { dayOfWeek: 6, label: 'Sábado' },
  { dayOfWeek: 0, label: 'Domingo' },
];

const SCHEDULE_FIELD_CLASS = 'flex flex-col gap-2 w-full';
const SCHEDULE_LABEL_CLASS = 'text-md text-neutral-300';
const SCHEDULE_LIST_CLASS = 'flex flex-col w-full';

// table-auto reemplaza el table-fixed por defecto de Table: las columnas "día" y
// "checkbox" se ajustan a su contenido, "horario" se estira (width: 100%).
// border-spacing-y recrea el gap-y entre filas de la versión con grid.
const SCHEDULE_TABLE_CLASS = 'table-auto border-separate border-spacing-x-0 border-spacing-y-(--size-s)';
const TABLE_ROW_HEIGHT_CLASS = 'h-(--size-5xl)';

// min-h + h-full en la celda (además de la altura de fila) para que el contenido
// de cada columna quede centrado y las tres columnas midan siempre lo mismo.
const DAY_CELL_CLASS = 'min-h-(--size-5xl) h-full align-middle rounded-l-2xl border border-r-0 border-neutral-700 bg-neutral-800 px-(--size-m)';
const CHECKBOX_CELL_CLASS = 'min-h-(--size-5xl) h-full align-middle border-y border-neutral-700 bg-neutral-800 px-(--size-m)';
const SCHEDULE_CELL_CLASS = 'min-h-(--size-5xl) h-full align-middle rounded-r-2xl border border-l-0 border-neutral-700 bg-neutral-800 px-(--size-m) py-(--size-s)';

const DAY_CELL_CONTENT_CLASS = 'flex h-full items-center';
const CHECKBOX_CELL_CONTENT_CLASS = 'flex h-full items-center';
const SCHEDULE_CELL_CONTENT_CLASS = 'flex h-full flex-col justify-center gap-(--size-s)';
const DAY_NAME_CLASS = 'shrink-0 text-sm font-medium text-neutral-100';
const DAY_OPEN_CLASS = 'flex shrink-0 items-center gap-2 text-sm text-neutral-300';

const RANGE_LINE_CLASS = 'flex w-full shrink-0 items-center gap-(--size-s)';
const RANGE_ERROR_CLASS = 'shrink-0 text-xs text-red-400';
const TIME_INPUT_CLASS = 'min-w-0 w-full flex-1';
const TIME_INPUT_ERROR_CLASS = 'border-red-400 focus:border-red-400';
const DAYS_OFF_CLASS = 'text-sm text-neutral-500 w-full';
const ADD_TURN_BUTTON_CLASS = 'flex h-(--size-l) w-(--size-l) shrink-0 items-center justify-center rounded-xl bg-transparent text-neutral-300';
const REMOVE_TURN_BUTTON_CLASS = 'flex h-(--size-l) w-(--size-l) shrink-0 items-center justify-center rounded-xl bg-transparent text-neutral-500';

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Un rango es válido si, con ambos horarios cargados, "desde" es estrictamente
// menor a "hasta". Un rango incompleto (todavía sin terminar de cargar) no se
// considera inválido para no mostrar error mientras el usuario está eligiendo.
function isRangeOrderValid(range: TimeRange): boolean {
  if (!range.startTime || !range.endTime) {
    return true;
  }
  return timeToMinutes(range.startTime) < timeToMinutes(range.endTime);
}

function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
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
function getDayError(ranges: TimeRange[]): string | null {
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

// Sólo se emiten los turnos completos, con orden correcto (desde < hasta) y sin
// superposición con otro turno del mismo día. Un turno inválido queda visible en
// la UI (con su mensaje de error) pero nunca llega al schedule final que recibe
// el padre vía onChange.
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

export default function EntityWeekSchedule({ value, onChange, readOnly = false }: EntityWeekScheduleProps) {
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
    if (current.ranges.length >= 2) {
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
    updateDay(dayOfWeek, {
      ranges: current.ranges.map((range, rangeIndex) =>
        rangeIndex === index ? { ...range, ...patch } : range,
      ),
    });
  };

  const columns: TableColumn<DayRow>[] = [
    {
      key: 'day',
      header: null,
      cellClassName: DAY_CELL_CLASS,
      cell: (row) => (
        <div className={DAY_CELL_CONTENT_CLASS}>
          <span className={DAY_NAME_CLASS}>{row.label}</span>
        </div>
      ),
    },
    {
      key: 'checkbox',
      header: null,
      cellClassName: CHECKBOX_CELL_CLASS,
      cell: (row) => {
        const day = days[row.dayOfWeek];

        return (
          <div className={CHECKBOX_CELL_CONTENT_CLASS}>
            <span className={DAY_OPEN_CLASS}>
              <Checkbox
                id={`week-day-${row.dayOfWeek}`}
                checked={day.works}
                disabled={readOnly}
                onChange={(_, checked) => toggleWorks(row.dayOfWeek, checked)}
              />
              <span>Trabaja</span>
            </span>
          </div>
        );
      },
    },
    {
      key: 'schedule',
      header: null,
      width: '100%',
      cellClassName: SCHEDULE_CELL_CLASS,
      cell: (row) => {
        const day = days[row.dayOfWeek];

        if (!day.works) {
          return (
            <span className="flex h-full w-full items-center justify-center">
              <span className={DAYS_OFF_CLASS}>No trabaja</span>
            </span>
          );
        }

        return (
          <div className={SCHEDULE_CELL_CONTENT_CLASS}>
            {day.ranges.map((range, index) => {
              // Turno anterior y siguiente (si existen) del mismo día: se usan
              // para acotar los <input type="time"> con min/max y así guiar al
              // usuario mientras elige, evitando que arme rangos que se crucen.
              const prevRange = index > 0 ? day.ranges[index - 1] : undefined;
              const nextRange = index < day.ranges.length - 1 ? day.ranges[index + 1] : undefined;
              const invalid = !isRangeOrderValid(range) || day.ranges.some(
                (other, otherIndex) => otherIndex !== index && rangesOverlap(range, other),
              );

              return (
                <div key={index} className={RANGE_LINE_CLASS}>
                  <Input
                    name={`week-start-${row.dayOfWeek}-${index}`}
                    type="time"
                    value={range.startTime}
                    min={prevRange?.endTime || undefined}
                    max={range.endTime || undefined}
                    onChange={(event) => updateRange(row.dayOfWeek, index, { startTime: event.target.value })}
                    readOnly={readOnly}
                    className={`${TIME_INPUT_CLASS} ${invalid ? TIME_INPUT_ERROR_CLASS : ''}`}
                  />
                  <span className="text-neutral-500">—</span>
                  <Input
                    name={`week-end-${row.dayOfWeek}-${index}`}
                    type="time"
                    value={range.endTime}
                    min={range.startTime || undefined}
                    max={nextRange?.startTime || undefined}
                    onChange={(event) => updateRange(row.dayOfWeek, index, { endTime: event.target.value })}
                    readOnly={readOnly}
                    className={`${TIME_INPUT_CLASS} ${invalid ? TIME_INPUT_ERROR_CLASS : ''}`}
                  />
                  {!readOnly && index > 0 ? (
                    <Button
                      type="button"
                      className={REMOVE_TURN_BUTTON_CLASS}
                      onClick={() => removeRange(row.dayOfWeek, index)}
                      icon={<X size="var(--size-m)" />}
                      aria-label="Quitar turno"
                    />
                  ) : null}
                  {index === 0 ? (
                    <Button
                      type="button"
                      className={ADD_TURN_BUTTON_CLASS}
                      disabled={readOnly || day.ranges.length >= 2}
                      onClick={() => addRange(row.dayOfWeek)}
                      icon={<Plus size="var(--size-m)" />}
                      aria-label="Agregar turno"
                    />
                  ) : null}
                </div>
              );
            })}
            {getDayError(day.ranges) ? (
              <span className={RANGE_ERROR_CLASS}>{getDayError(day.ranges)}</span>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className={SCHEDULE_FIELD_CLASS}>
      <p className={SCHEDULE_LABEL_CLASS}>Horarios semanales</p>
      <Box className={SCHEDULE_LIST_CLASS}>
        <Table
          columns={columns}
          rows={DAYS}
          rowHeightClassName={TABLE_ROW_HEIGHT_CLASS}
          className={SCHEDULE_TABLE_CLASS}
          showHeader={false}
        />
      </Box>
    </div>
  );
}