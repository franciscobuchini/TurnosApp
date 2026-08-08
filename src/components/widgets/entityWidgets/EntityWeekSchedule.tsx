import { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { OpeningHoursEntry } from '../../../database/types';
import HourSelector from '../../interface/HourSelector';
import Checkbox from '../../interface/Checkbox';
import Button from '../../interface/Button';
import Table, { type TableColumn } from '../../interface/Table';

/*
  src/components/widgets/entityWidgets/EntityWeekSchedule.tsx
  Selector semanal (lunes a domingo) para elegir los horarios en los que se trabaja.
  Cada día puede tener varios turnos (doble/triple). Se emiten entradas del tipo
  OpeningHoursEntry: { dayOfWeek, startTime, endTime } con dayOfWeek 0 = Domingo.

  El componente raíz es un <div flex-col>, y cada día de la semana se renderiza
  como su propia <Table> de UNA sola fila (en vez de una única Table de 7 filas
  como antes). Cada día queda como una "pill" independiente; la separación entre
  días la da el gap del contenedor flex, no border-spacing de una tabla común.

  Como cada día vive ahora en su propia <table> (table-auto), el ancho de cada
  columna se calcula de forma INDEPENDIENTE por tabla según su propio contenido.
  Para que las columnas sigan alineadas entre un día y otro (que "Horario"
  arranque siempre en la misma posición X), las columnas de ancho fijo
  (checkbox y nombre del día) declaran un `width` explícito — ya no alcanza con
  dejar que table-auto lo infiera fila por fila.

  El borde/redondeo de cada celda ("pill" por día) se calcula según la POSICIÓN
  de la columna en el array (ver getEdgeClassName/withPillEdges), no por nombre
  de columna. Así, reordenar columnas nunca rompe los rounded-borders.

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

const SCHEDULE_FIELD_CLASS = 'flex flex-col gap-(--size-s) w-full';
const SCHEDULE_LABEL_CLASS = 'text-md text-neutral-300';

// Contenedor de los 7 días: cada día es ahora una <Table> independiente, así
// que el gap-y acá es lo que reemplaza al border-spacing-y que antes daba la
// separación entre filas de una única tabla compartida.
const SCHEDULE_LIST_CLASS = 'flex flex-col gap-(--size-s) w-full';

// table-auto reemplaza el table-fixed por defecto de Table: las columnas de
// contenido fijo se ajustan a su contenido, "horario" se estira (width: 100%).
const SCHEDULE_TABLE_CLASS = 'table-auto border-separate border-spacing-x-0';
const TABLE_ROW_HEIGHT_CLASS = 'h-(--size-5xl)';

// Anchos fijos para que checkbox/día no varíen de una tabla (día) a otra —
// necesario ahora que cada día calcula su table-auto por separado.
const CHECKBOX_COLUMN_WIDTH = '2.5rem';
const DAY_COLUMN_WIDTH = '7rem';

// Estilo común a toda celda de la "pill": altura, alineación, fondo y borde
// horizontal. El borde/rounded vertical (izquierda/derecha) NO va acá — se
// agrega según posición con getEdgeClassName, para que no dependa de qué
// columna es sino de dónde está parada en la fila.
const CELL_BASE_CLASS = 'min-h-(--size-5xl) h-full align-middle border-y border-neutral-700 bg-neutral-800 px-(--size-xs)';
const SCHEDULE_CELL_CLASS = `${CELL_BASE_CLASS} py-(--size-s)`;

const DAY_CELL_CONTENT_CLASS = 'flex h-full items-center w-28';
const SCHEDULE_CELL_CONTENT_CLASS = 'flex h-full flex-col justify-center gap-(--size-s)';
const DAY_NAME_CLASS = 'shrink-0 text-sm font-medium text-neutral-100';
const DAY_OPEN_CLASS = 'flex shrink-0 items-center gap-2 text-sm text-neutral-300';

const RANGE_LINE_CLASS = 'flex w-full shrink-0 items-center gap-(--size-s)';
const RANGE_ERROR_CLASS = 'shrink-0 text-xs text-red-400';
const TIME_INPUT_ERROR_CLASS = 'border-red-400 focus:border-red-400';
const DAYS_OFF_CLASS = 'text-sm text-neutral-500 w-full flex justify-center';
const ADD_TURN_BUTTON_CLASS = 'flex h-(--size-l) w-(--size-l) shrink-0 items-center justify-center rounded-xl bg-transparent text-neutral-300';
const REMOVE_TURN_BUTTON_CLASS = 'flex h-(--size-l) w-(--size-l) shrink-0 items-center justify-center rounded-xl bg-transparent text-neutral-500';

// Devuelve el borde lateral + rounded que le toca a una celda según su
// POSICIÓN en la fila (no según qué columna es). Primera columna: borde y
// rounded a la izquierda. Última: a la derecha. Del medio: sin borde lateral
// ni rounded, para que la fila se siga viendo como una sola "pill" continua.
function getEdgeClassName(index: number, total: number): string {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  if (isFirst && isLast) return 'border-x rounded-2xl';
  if (isFirst) return 'border-l rounded-l-2xl';
  if (isLast) return 'border-r rounded-r-2xl';
  return '';
}

// Recorre las columnas en el orden en que fueron declaradas y les mergea el
// borde/rounded que corresponde a esa posición. Al depender del índice del
// array y no de un nombre fijo, reordenar columnas (como mover "checkbox"
// antes que "day") nunca vuelve a romper los rounded-borders.
function withPillEdges(columns: TableColumn<DayRow>[]): TableColumn<DayRow>[] {
  return columns.map((column, index) => ({
    ...column,
    cellClassName: twMerge(
      column.cellClassName as string,
      getEdgeClassName(index, columns.length),
    ),
  }));
}

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

  // Orden real de las columnas: acá es donde se reordena si hace falta.
  // El redondeo de bordes se resuelve solo, gracias a withPillEdges() más abajo.
  const columns: TableColumn<DayRow>[] = withPillEdges([
    {
      key: 'checkbox',
      header: null,
      width: CHECKBOX_COLUMN_WIDTH,
      cellClassName: CELL_BASE_CLASS,
      cell: (row) => {
        const day = days[row.dayOfWeek];

        return (
          <span className={DAY_OPEN_CLASS}>
            <Checkbox
              id={`week-day-${row.dayOfWeek}`}
              checked={day.works}
              disabled={readOnly}
              onChange={(_, checked) => toggleWorks(row.dayOfWeek, checked)}
            />
          </span>
        );
      },
    },
    {
      key: 'day',
      header: null,
      width: DAY_COLUMN_WIDTH,
      cellClassName: CELL_BASE_CLASS,
      cell: (row) => (
        <div className={DAY_CELL_CONTENT_CLASS}>
          <span className={DAY_NAME_CLASS}>{row.label}</span>
        </div>
      ),
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
              <span className={DAYS_OFF_CLASS}>No trabaja</span>
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
                  <HourSelector
                    value={range.startTime}
                    min={prevRange?.endTime || undefined}
                    max={range.endTime || undefined}
                    onChange={(time) => updateRange(row.dayOfWeek, index, { startTime: time })}
                    readOnly={readOnly}
                    className={invalid ? TIME_INPUT_ERROR_CLASS : ''}
                  />
                  <span className="text-neutral-500">—</span>
                  <HourSelector
                    value={range.endTime}
                    min={range.startTime || undefined}
                    max={nextRange?.startTime || undefined}
                    onChange={(time) => updateRange(row.dayOfWeek, index, { endTime: time })}
                    readOnly={readOnly}
                    className={invalid ? TIME_INPUT_ERROR_CLASS : ''}
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
                  {index === 0 && !readOnly ? (
                    <Button
                      type="button"
                      className={ADD_TURN_BUTTON_CLASS}
                      disabled={day.ranges.length >= 2}
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
  ]);

  return (
    <div className={SCHEDULE_FIELD_CLASS}>
      <p className={SCHEDULE_LABEL_CLASS}>Días y horarios de trabajo</p>
      <div className={SCHEDULE_LIST_CLASS}>
        {DAYS.map((day) => (
          <Table
            key={day.dayOfWeek}
            columns={columns}
            rows={[day]}
            rowHeightClassName={TABLE_ROW_HEIGHT_CLASS}
            className={SCHEDULE_TABLE_CLASS}
            showHeader={false}
          />
        ))}
      </div>
    </div>
  );
}