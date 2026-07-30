/* 
  src/components/widgets/MonthlyView.tsx
  Vista mensual de la agenda, utilizando el componente Table genérico para la estructura.
*/

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';
import Box from '../interface/Box';
import Table, { type TableColumn } from '../interface/Table';
import ContentHeader from './ContentHeader';

interface CalendarProps {
  className?: string;
  styleClassName?: string;
}

/* MonthlyViewClasses: contenedor (Box)*/
const MonthlyViewClasses = {
  required: 'flex flex-col  w-full gap-(--size-m)',
  style: 'bg-stone-900 rounded-3xl',
};

/* MonthlyViewActionsClasses: wrapper de los botones de navegación*/
const MonthlyViewActionsClasses = {
  required: 'flex gap-(--size-s)',
  style: '',
};

/* MonthlyViewTableClasses: clase pasada al componente Table*/
const MonthlyViewTableClasses = {
  required: '',
  style: 'text-white',
};

/* MonthlyViewDayCircleClasses: el círculo con el número del día, ahora es todo el contenido de la celda */
const MonthlyViewDayCircleClasses = {
  required: 'flex items-center justify-center w-(--size-xl) h-(--size-xl) mx-auto text-sm',
  style: 'rounded-full',
};
const MonthlyViewDayCircleOtherMonthRequired = 'opacity-30';

/* MonthlyViewTodayCircleClasses: resalte del círculo de hoy, ahora se aplica al círculo y no a toda la celda */
const MonthlyViewTodayCircleClasses = {
  required: '',
  style: 'bg-white text-stone-800 rounded-full',
};

/* MonthlyViewColumnAlignClasses: alineación y padding de cada columna de la tabla*/
const MonthlyViewColumnAlignClasses = {
  required: 'align-middle p-(--size-xs) text-center',
  style: '',
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

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

export default function Calendar({ className, styleClassName }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
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

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Configuración de las columnas de la tabla
  const columns: TableColumn<CalendarCell[]>[] = daysOfWeek.map((day, idx) => ({
    key: day,
    header: day,
    cell: (weekCells) => {
      const cell = weekCells[idx];
      if (!cell) return null;

      const isToday = isSameDay(cell.date, new Date());

      return (
        <div
          className={twMerge(
            MonthlyViewDayCircleClasses.required,
            isToday ? MonthlyViewTodayCircleClasses.style : MonthlyViewDayCircleClasses.style,
            !cell.isCurrentMonth ? MonthlyViewDayCircleOtherMonthRequired : '',
          )}
        >
          {cell.day}
        </div>
      );
    },
    alignClassName: twMerge(MonthlyViewColumnAlignClasses.required, MonthlyViewColumnAlignClasses.style),
  }));

  return (
    <Box
      className={twMerge(
        MonthlyViewClasses.required,
        styleClassName || MonthlyViewClasses.style,
        className,
      )}
    >
      {/* Cabecera de navegación */}
      <ContentHeader
        title={`${MONTH_NAMES[month]} ${year}`}
        action={
          <div className={twMerge(MonthlyViewActionsClasses.required, MonthlyViewActionsClasses.style)}>
            <Button textAlign="center" height="h-(--size-xl)" onClick={prevMonth} icon={<ChevronLeft size={18} />} />
            <Button textAlign="center" height="h-(--size-xl)" onClick={nextMonth} icon={<ChevronRight size={18} />} />
          </div>
        }
      />

      {/* Renderizado de la grilla mensual utilizando el componente Table */}
      <Table
        columns={columns}
        rows={weeks}
        rowHeightClassName="h-auto"
        className={twMerge(MonthlyViewTableClasses.required, MonthlyViewTableClasses.style)}
      />
    </Box>
  );
}