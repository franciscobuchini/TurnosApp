/* 
  src/components/widgets/Calendar.tsx
  Vista mensual de la agenda, utilizando el componente Table genérico para la estructura.
*/

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Table, type TableColumn } from '@/components/ui/table';
import ContentHeader from '@/components/ui/content-header';
import CalendarNavigationButtons from '../../buttons/CalendarNavigationButtons';
import SummaryButton from '../../buttons/SummaryButton';
import { DAY_NAMES, MONTH_NAMES, isSameDay } from '@/utils/dateName';
import { useFiltersGroup } from '@/hooks/useFiltersGroup';

interface CalendarProps {
  weekDaysNames?: string[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
}

const CALENDAR_CLASS = 'group flex w-full shrink-0 flex-col cursor-pointer open:gap-2 p-1 bg-card rounded-3xl';

const CALENDAR_ACTIONS_CLASS = 'flex gap-3';

const CALENDAR_TABLE_CLASS = 'text-white';

const CALENDAR_TABLE_HEADER_CLASS = 'bg-transparent';

const CALENDAR_DAY_CIRCLE_CLASS = 'flex items-center justify-center w-8 h-8 mx-auto text-sm cursor-pointer rounded-full';
const CALENDAR_DAY_CIRCLE_DEFAULT_CLASS = 'hover:bg-neutral-700';
const CALENDAR_DAY_CIRCLE_OTHER_MONTH_CLASS = 'opacity-30';
const CALENDAR_DAY_CELL_CLASS = 'flex items-center justify-center cursor-pointer';

const CALENDAR_TODAY_CIRCLE_CLASS = 'bg-(--palette-03) text-neutral-800 font-medium rounded-full';

const CALENDAR_SELECTED_CIRCLE_CLASS = 'bg-(--palette-01) text-neutral-800 font-medium rounded-full';

const CALENDAR_COLUMN_ALIGN_CLASS = 'align-middle px-2 py-1 text-center';
const CALENDAR_SUMMARY_CLASS = 'list-none outline-none [&::-webkit-details-marker]:hidden';
const CALENDAR_TITLE_CLOSED_CLASS = 'group-open:hidden';
const CALENDAR_TITLE_OPEN_CLASS = 'hidden group-open:block';
const CALENDAR_SUMMARY_BUTTON_CLASS = 'block group-open:hidden';
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
      const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;

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
              isSelected
                ? CALENDAR_SELECTED_CIRCLE_CLASS
                : isToday
                  ? CALENDAR_TODAY_CIRCLE_CLASS
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

  const groupName = useFiltersGroup();

  const handleSummaryClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;

    const details = event.currentTarget.parentElement as HTMLDetailsElement | null;
    if (details?.open) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <details
      data-calendar
      open
      name={groupName}
      className={twMerge(CALENDAR_CLASS, className)}
    >
      {/* Cabecera de navegación */}
      <summary
        className={CALENDAR_SUMMARY_CLASS}
        onClick={handleSummaryClick}
      >
        <ContentHeader
          title={
            <>
              <span className={CALENDAR_TITLE_CLOSED_CLASS}>Calendario</span>
              <span className={CALENDAR_TITLE_OPEN_CLASS}>{`${MONTH_NAMES[month]} ${year}`}</span>
            </>
          }
          action={
            <div
              className={CALENDAR_ACTIONS_CLASS}
            >
              <CalendarNavigationButtons
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
              />
              <SummaryButton className={CALENDAR_SUMMARY_BUTTON_CLASS} />
            </div>
          }
        />
      </summary>

      {/* Renderizado de la grilla mensual utilizando el componente Table */}
      <Table
        columns={columns}
        rows={weeks}
        rowHeightClassName={CALENDAR_ROW_HEIGHT_CLASS}
        className={CALENDAR_TABLE_CLASS}
        headerClassName={CALENDAR_TABLE_HEADER_CLASS}
      />
    </details>
  );
}
