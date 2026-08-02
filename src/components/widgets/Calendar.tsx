/* 
  src/components/widgets/Calendar.tsx
  Vista mensual de la agenda, utilizando el componente Table genérico para la estructura.
*/

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';
import Box from '../interface/Box';
import Table, { type TableColumn } from '../interface/Table';
import ContentHeader from './ContentHeader';
import { DAY_NAMES, MONTH_NAMES, isSameDay } from '../../functions/dateName';

interface CalendarProps {
  weekDaysNames?: string[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
}

/* CalendarClasses: contenedor (Box)*/
const CalendarClasses = {
  required: 'flex flex-col  w-full gap-(--size-xs)',
  style: 'bg-stone-900 rounded-3xl',
};

/* CalendarActionsClasses: wrapper de los botones de navegación*/
const CalendarActionsClasses = {
  required: 'flex gap-(--size-s)',
  style: '',
};

const CalendarActionButtonClasses = {
  required: 'h-(--size-xl)',
  style: '',
};

/* CalendarTableClasses: clase pasada al componente Table*/
const CalendarTableClasses = {
  required: '',
  style: 'text-white',
};

/* CalendarDayCircleClasses: el círculo con el número del día, ahora es todo el contenido de la celda */
const CalendarDayCircleClasses = {
  required: 'flex items-center justify-center w-(--size-xl) h-(--size-xl) mx-auto text-sm cursor-pointer',
  style: 'rounded-full',
};
const CalendarDayCircleOtherMonthRequired = 'opacity-30';

/* CalendarTodayCircleClasses: resalte del círculo cuando ese día es hoy, pero no está seleccionado */
const CalendarTodayCircleClasses = {
  required: '',
  style: 'ring-2 ring-white rounded-full',
};

/* CalendarSelectedCircleClasses: resalte del círculo del día seleccionado (prioridad sobre el de hoy) */
const CalendarSelectedCircleClasses = {
  required: '',
  style: 'bg-white text-stone-800 rounded-full',
};

/* CalendarColumnAlignClasses: alineación y padding de cada columna de la tabla*/
const CalendarColumnAlignClasses = {
  required: 'align-middle p-(--size-xs) text-center',
  style: '',
};

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

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
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
          onClick={() => onSelectDate?.(cell.date)}
          className={twMerge(
            CalendarDayCircleClasses.required,
            isSelected
              ? twMerge(CalendarSelectedCircleClasses.required, CalendarSelectedCircleClasses.style)
              : isToday
                ? twMerge(CalendarTodayCircleClasses.required, CalendarTodayCircleClasses.style)
                : CalendarDayCircleClasses.style,
            !cell.isCurrentMonth ? CalendarDayCircleOtherMonthRequired : '',
          )}
        >
          {cell.day}
        </div>
      );
    },
    alignClassName: twMerge(CalendarColumnAlignClasses.required, CalendarColumnAlignClasses.style),
  }));

  return (
    <Box
      className={twMerge(
        CalendarClasses.required,
        CalendarClasses.style,
        className,
      )}
    >
      {/* Cabecera de navegación */}
      <ContentHeader
        title={`${MONTH_NAMES[month]} ${year}`}
        action={
          <div className={twMerge(CalendarActionsClasses.required, CalendarActionsClasses.style)}>
            <Button
              onClick={prevMonth}
              iconOnly="bottom"
              className={twMerge(CalendarActionButtonClasses.required, CalendarActionButtonClasses.style)}
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              onClick={nextMonth}
              iconOnly="bottom"
              className={twMerge(CalendarActionButtonClasses.required, CalendarActionButtonClasses.style)}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        }
      />

      {/* Renderizado de la grilla mensual utilizando el componente Table */}
      <Table
        columns={columns}
        rows={weeks}
        rowHeightClassName="h-auto"
        className={twMerge(CalendarTableClasses.required, CalendarTableClasses.style)}
      />
    </Box>
  );
}