/* 
  src/components/widgets/MonthlyView.tsx
  Vista mensual de la agenda, utilizando el componente Table genérico para la estructura.
*/

import { useState } from 'react';
import Button from '../../components/interface/Button';
import Box from '../../components/interface/Box';
import Table, { type TableColumn } from '../../components/interface/Table';

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

export default function MonthlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
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

      const isCurrentMonth = cell.isCurrentMonth;
      // Simular algunos turnos de prueba en la vista actual
      const hasTurno = isCurrentMonth && (cell.day + idx) % 7 === 0;

      return (
        <div
          className={`flex flex-col justify-between w-full min-h-(--size-5xl) ${
            isCurrentMonth ? '' : 'opacity-30'
          }`}
        >
          <span>{cell.day}</span>
          {hasTurno && (
            <div className="border border-black text-center">
              Turno
            </div>
          )}
        </div>
      );
    },
    alignClassName: 'align-top border border-black p-(--size-xs)',
    cellClassName: (weekCells) => {
      const cell = weekCells[idx];
      if (cell && isSameDay(cell.date, new Date())) {
        return 'border-2 border-black';
      }
      return '';
    },
    headerClassName: 'text-center font-bold p-(--size-xs)',
  }));

  return (
    <Box className="flex flex-col border border-black gap-(--size-xl) p-(--size-xl)">
      {/* Cabecera de navegación */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex gap-(--size-m)">
          <Button onClick={prevMonth}>
            Anterior
          </Button>
          <Button onClick={nextMonth}>
            Siguiente
          </Button>
        </div>
      </div>

      {/* Renderizado de la grilla mensual utilizando el componente Table */}
      <Table
        columns={columns}
        rows={weeks}
        rowHeightClassName="h-auto"
        className="border-collapse"
      />
    </Box>
  );
}
