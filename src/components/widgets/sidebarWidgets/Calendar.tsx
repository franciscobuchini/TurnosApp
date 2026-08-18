/* 
  src/components/widgets/Calendar.tsx
  Vista mensual de la agenda, utilizando el componente Table genérico para la estructura.
*/

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Table, type TableColumn } from '@/components/ui/table';
import ContentHeader from '@/components/ui/content-header';
import CalendarNavigationButtons from '../../buttons/CalendarNavigationButtons';
import { getOpeningHours } from '@/database/data';
import { getBusinessHoursByDay } from '@/hooks/useWeekSchedule';
import { isBusinessDayAnyUnblocked, isBusinessDayFullyBlocked } from '@/functions/scheduleCellAvailability';
import { DAY_NAMES, MONTH_NAMES, isSameDay } from '@/utils/dateName';

interface CalendarProps {
  weekDaysNames?: string[];
  selectedDate?: Date;
  /** Selección múltiple (ej. "Bloquear día del negocio"): si se pasa, un
      día se resalta cuando matchea cualquiera de estos, en vez de contra
      selectedDate. onSelectDate se sigue disparando por cada click (uno a
      la vez); es quien la usa el que decide si suma/saca del array. */
  selectedDates?: Date[];
  selectedDatesVariant?: 'destructive' | 'unblock';
  onSelectDate?: (date: Date) => void;
  className?: string;
}

const CALENDAR_CLASS = 'flex w-full shrink-0 flex-col gap-2 p-2 py-4 bg-card rounded-4xl border border-border';

const CALENDAR_ACTIONS_CLASS = 'flex gap-3';

const CALENDAR_TABLE_CLASS = 'text-foreground';

const CALENDAR_TABLE_HEADER_CLASS = 'bg-transparent';

const CALENDAR_DAY_CIRCLE_CLASS = 'flex items-center justify-center w-8 h-8 mx-auto text-sm cursor-pointer rounded-full';
const CALENDAR_DAY_CIRCLE_DEFAULT_CLASS = 'hover:bg-muted';
/* Día sin horario de atención ("día libre") o bloqueado entero a mano
   ("Bloquear día del negocio"): mismo hover que el default, pero con el
   texto más apagado para distinguirlos de un vistazo de los días
   normales — pisado por seleccionado/hoy (ver isSelected/isToday más
   abajo), estos días se siguen pudiendo elegir igual. */
const CALENDAR_DAY_CIRCLE_MUTED_CLASS = 'text-muted-foreground/50 hover:bg-muted';
const CALENDAR_DAY_CIRCLE_OTHER_MONTH_CLASS = 'opacity-30';
const CALENDAR_DAY_CELL_CLASS = 'flex items-center justify-center cursor-pointer';

const CALENDAR_TODAY_CIRCLE_CLASS = 'bg-(--palette-02) text-black font-medium rounded-full';

const CALENDAR_SELECTED_CIRCLE_CLASS = 'bg-(--palette-01) text-black font-medium rounded-full';

/* Selección múltiple (selectedDates, ej. "Bloquear día del negocio"): color
   destructive en vez del palette-01 de selectedDate — ahí "seleccionado" es
   sólo "estoy viendo este día", acá es "este día va a quedar bloqueado",
   mismo rojo sólido que ya usan fila/columna bloqueadas en Schedule.tsx.
   Mismo par bg/text que la variant "destructive" de Button (ver button.tsx). */
const CALENDAR_SELECTED_DATES_CIRCLE_CLASS = 'bg-destructive text-background font-medium rounded-full';
const CALENDAR_SELECTED_DATES_UNBLOCK_CIRCLE_CLASS = 'bg-(--palette-01) text-black font-medium rounded-full';

const CALENDAR_COLUMN_ALIGN_CLASS = 'align-middle px-2 py-1 text-center';
const CALENDAR_ROW_HEIGHT_CLASS = 'h-auto';

/* MONDAY_FIRST_DAY_NAMES: DAY_NAMES reordenado para que la semana arranque en Lunes */
const MONDAY_FIRST_DAY_NAMES = [1, 2, 3, 4, 5, 6, 0].map((i) => DAY_NAMES[i]);

interface CalendarCell {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

const getDaysInMonth = (year: number, month: number): CalendarCell[] => {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Obtener el día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
  let firstDayIndex = firstDay.getDay();
  // Ajustar para que Lunes sea 0 y Domingo 6
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const cells: CalendarCell[] = [];

  // Días del mes anterior para rellenar
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({
      day: d,
      isCurrentMonth: false,
      date: new Date(year, month - 1, d),
    });
  }

  // Días del mes actual
  for (let i = 1; i <= totalDays; i++) {
    cells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Completar hasta múltiplo de 7
  const remaining = cells.length % 7;
  if (remaining > 0) {
    const fillCount = 7 - remaining;
    for (let i = 1; i <= fillCount; i++) {
      cells.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }
  }

  // Si la cantidad de celdas es menor que 35, agregar otra fila de relleno
  while (cells.length < 35) {
    const lastCell = cells[cells.length - 1];
    const nextDay = lastCell.isCurrentMonth ? 1 : lastCell.day + 1;
    const nextMonthVal = lastCell.isCurrentMonth ? month + 1 : month + 2;
    cells.push({
      day: nextDay,
      isCurrentMonth: false,
      date: new Date(year, nextMonthVal, nextDay),
    });
  }

  return cells;
};

export default function Calendar({
  weekDaysNames = MONDAY_FIRST_DAY_NAMES,
  selectedDate,
  selectedDates,
  selectedDatesVariant = 'destructive',
  onSelectDate,
  className,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const cells = getDaysInMonth(year, month);

  // Agrupar las celdas en filas de 7 días (semanas)
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  /* Horario del negocio por día de semana — para apagar los días sin
     ningún tramo de apertura ("día libre") y distinguirlos de los que sí
     abren, mismo criterio que ya usa Schedule.tsx (businessRanges vacío =
     cerrado). */
  const hoursByDay = getBusinessHoursByDay(getOpeningHours());

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Configuración de las columnas de la tabla
  const columns: TableColumn<CalendarCell[]>[] = weekDaysNames.map((name, idx) => ({
    key: `day-${idx}`,
    header: name.slice(0, 2),
    cell: (weekCells) => {
      const cell = weekCells[idx];
      if (!cell) return null;

      const isToday = isSameDay(cell.date, new Date());
      const isMultiSelected = selectedDates?.some((date) => isSameDay(cell.date, date)) ?? false;
      const isSelected = !isMultiSelected && selectedDate ? isSameDay(cell.date, selectedDate) : false;
      const isDayOff = (hoursByDay[cell.date.getDay()] ?? []).length === 0;
      const isAnyUnblocked = isBusinessDayAnyUnblocked(cell.date);
      const isMuted = (isDayOff && !isAnyUnblocked) || isBusinessDayFullyBlocked(cell.date);

      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectDate?.(cell.date);
          }}
          className={CALENDAR_DAY_CELL_CLASS}
        >
          <div
            className={twMerge(
              CALENDAR_DAY_CIRCLE_CLASS,
              isMultiSelected
                ? selectedDatesVariant === 'unblock'
                  ? CALENDAR_SELECTED_DATES_UNBLOCK_CIRCLE_CLASS
                  : CALENDAR_SELECTED_DATES_CIRCLE_CLASS
                : isSelected
                  ? CALENDAR_SELECTED_CIRCLE_CLASS
                  : isToday
                    ? CALENDAR_TODAY_CIRCLE_CLASS
                    : isMuted
                      ? CALENDAR_DAY_CIRCLE_MUTED_CLASS
                      : CALENDAR_DAY_CIRCLE_DEFAULT_CLASS,
              !cell.isCurrentMonth ? CALENDAR_DAY_CIRCLE_OTHER_MONTH_CLASS : '',
            )}
          >
            {cell.day}
          </div>
        </div>
      );
    },
    alignClassName: CALENDAR_COLUMN_ALIGN_CLASS,
  }));

  return (
    <div className={twMerge(CALENDAR_CLASS, className)}>
      {/* Cabecera de navegación */}
      <div>
        <ContentHeader
          title={`${MONTH_NAMES[month]} ${year}`}
          action={
            <div className={CALENDAR_ACTIONS_CLASS}>
              <CalendarNavigationButtons
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
              />
            </div>
          }
        />
      </div>

      {/* Renderizado de la grilla mensual utilizando el componente Table */}
      <Table
        columns={columns}
        rows={weeks}
        rowHeightClassName={CALENDAR_ROW_HEIGHT_CLASS}
        className={CALENDAR_TABLE_CLASS}
        headerClassName={CALENDAR_TABLE_HEADER_CLASS}
      />
    </div>
  );
}
