import { useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { OpeningHoursEntry } from '../../../database/types';
import HourSelector from '@/components/ui/hour-selector';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, type TableColumn } from '@/components/ui/table';
import {
  DAYS,
  getDayError,
  getBusinessHoursByDay,
  getBusinessDayLimits,
  isRangeOrderValid,
  rangesOverlap,
  useWeekSchedule,
  type DayRow,
} from '@/hooks/useWeekSchedule';

/*
  src/components/widgets/entityWidgets/EntityWeekSchedule.tsx
  Selector semanal (lunes a domingo) para elegir los horarios en los que se
  trabaja. Solo contiene la UI; la lógica (estado, validaciones, serialización)
  vive en src/hooks/useWeekSchedule.ts y la comparte con otros selectores de
  horarios (por ejemplo, el horario del local).

  Cada día de la semana se renderiza como su propia <Table> de UNA sola fila
  ("pill" independiente); la separación entre días la da el gap del contenedor.

  Como cada día vive en su propia <table> (table-auto), las columnas de ancho
  fijo (checkbox y nombre del día) declaran un `width` explícito para que
  "Horario" siempre arranque en la misma posición X entre días.

  El borde/redondeo de cada celda se calcula según la POSICIÓN de la columna
  en el array (getEdgeClassName/withPillEdges), no por nombre de columna.
*/

export interface EntityWeekScheduleProps {
  value?: OpeningHoursEntry[];
  onChange?: (schedule: OpeningHoursEntry[]) => void;
  readOnly?: boolean;
  title?: string;
  // Horario del local (apertura por día). Cuando se pasa, los selectores de
  // hora del trabajador bloquean los horarios en los que el local está
  // cerrado y los turnos editados se recortan a la ventana de apertura.
  businessHours?: OpeningHoursEntry[];
}

const SCHEDULE_FIELD_CLASS = 'flex flex-col gap-3 w-full min-h-0';
const SCHEDULE_LIST_CLASS = 'flex flex-col gap-2 w-full min-h-0 overflow-y-auto';
const SCHEDULE_TABLE_CLASS = 'table-auto border-separate border-spacing-x-0';
const TABLE_ROW_HEIGHT_CLASS = 'h-20';

const CHECKBOX_COLUMN_WIDTH = '2.5rem';
const DAY_COLUMN_WIDTH = '7rem';

const CELL_BASE_CLASS = 'min-h-20 h-full align-middle border-y border-input bg-input px-2';
const SCHEDULE_CELL_CLASS = `${CELL_BASE_CLASS} py-1`;

const DAY_CELL_CONTENT_CLASS = 'flex h-full items-center w-24';
const SCHEDULE_CELL_CONTENT_CLASS = 'flex h-full flex-col justify-center gap-1';
const DAY_NAME_CLASS = 'shrink-0 text-sm font-medium text-neutral-100';
const DAY_OPEN_CLASS = 'flex shrink-0 items-center text-sm text-neutral-300';

const RANGE_LINE_CLASS = 'flex w-full shrink-0 items-center gap-6';
const RANGE_ERROR_CLASS = 'shrink-0 text-xs text-red-400';
const TIME_INPUT_ERROR_CLASS = 'border-red-400 focus:border-red-400';
const DAYS_OFF_CLASS = 'text-sm text-neutral-500 w-full flex justify-center';
const ADD_TURN_BUTTON_CLASS = 'flex h-6 w-6 p-0 shrink-0 items-center justify-center bg-transparent hover:bg-transparent text-neutral-300';
const REMOVE_TURN_BUTTON_CLASS = 'flex h-6 w-6 p-0 shrink-0 items-center justify-center bg-transparent hover:bg-transparent text-neutral-500';

function getEdgeClassName(index: number, total: number): string {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  if (isFirst && isLast) return 'border-x rounded-2xl';
  if (isFirst) return 'border-l rounded-l-2xl';
  if (isLast) return 'border-r rounded-r-2xl';
  return '';
}

function withPillEdges(columns: TableColumn<DayRow>[]): TableColumn<DayRow>[] {
  return columns.map((column, index) => ({
    ...column,
    cellClassName: twMerge(
      column.cellClassName as string,
      getEdgeClassName(index, columns.length),
    ),
  }));
}

export default function EntityWeekSchedule({
  value,
  onChange,
  readOnly = false,
  title = 'Días y horarios de trabajo',
  businessHours,
}: EntityWeekScheduleProps) {
  const businessHoursByDay = useMemo(
    () => getBusinessHoursByDay(businessHours),
    [businessHours],
  );
  const businessLimits = useMemo(
    () => getBusinessDayLimits(businessHours),
    [businessHours],
  );
  const { days, toggleWorks, addRange, removeRange, updateRange } = useWeekSchedule({
    value,
    onChange,
    limits: businessLimits,
  });

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
              onCheckedChange={(checked) => toggleWorks(row.dayOfWeek, checked === true)}
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
                    businessHours={businessHoursByDay[row.dayOfWeek]}
                    onChange={(time) => updateRange(row.dayOfWeek, index, { startTime: time })}
                    readOnly={readOnly}
                    className={invalid ? TIME_INPUT_ERROR_CLASS : ''}
                  />
                  <span className="text-neutral-500">—</span>
                  <HourSelector
                    value={range.endTime}
                    min={range.startTime || undefined}
                    max={nextRange?.startTime || undefined}
                    businessHours={businessHoursByDay[row.dayOfWeek]}
                    onChange={(time) => updateRange(row.dayOfWeek, index, { endTime: time })}
                    readOnly={readOnly}
                    className={invalid ? TIME_INPUT_ERROR_CLASS : ''}
                  />
                  {!readOnly && index > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className={REMOVE_TURN_BUTTON_CLASS}
                      onClick={() => removeRange(row.dayOfWeek, index)}
                      icon={<X size={16} />}
                      aria-label="Quitar turno"
                    />
                  ) : null}
                  {index === 0 && !readOnly ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className={ADD_TURN_BUTTON_CLASS}
                      disabled={day.ranges.length >= 2}
                      onClick={() => addRange(row.dayOfWeek)}
                      icon={<Plus size={16} />}
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
      <Label>{title}</Label>
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