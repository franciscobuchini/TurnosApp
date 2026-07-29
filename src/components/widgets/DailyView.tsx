/* 
  src/components/widgets/DailyView.tsx
  Vista diaria de la agenda, organizada por bloques horarios representados con bordes.
  Permite navegar por días de la semana y desplazarse por fechas.
*/

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../../components/interface/Button';
import Box from '../../components/interface/Box';
import ContentHeader from './ContentHeader';
import WeekSelector from './WeekSelector';

interface DailyViewProps {
  className?: string;
  sizeClassName?: string;
  colorClassName?: string;
  shapeClassName?: string;
  animationClassName?: string;
}

const DailyViewStyle = {
  base: 'flex flex-col border border-black gap-(--size-xl) p-(--size-xl)',
  size: '',
  color: '',
  shape: '',
  animation: '',
};

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getWeekDays = (date: Date): Date[] => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + i);
    week.push(next);
  }
  return week;
};

const formatDate = (date: Date): string => {
  const dayName = WEEK_DAYS[date.getDay()];
  const dayNum = date.getDate();
  const monthName = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${dayNum} de ${monthName} de ${year}`;
};

export default function DailyView({
  className,
  sizeClassName,
  colorClassName,
  shapeClassName,
  animationClassName,
}: DailyViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const weekDays = getWeekDays(selectedDate);

  // Navegación diaria
  const prevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() - 1);
    setSelectedDate(next);
  };

  const nextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 1);
    setSelectedDate(next);
  };

  // Navegación semanal
  const prevWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() - 7);
    setSelectedDate(next);
  };

  const nextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 7);
    setSelectedDate(next);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  return (
    <Box
      className={twMerge(
        DailyViewStyle.base,
        sizeClassName || DailyViewStyle.size,
        colorClassName || DailyViewStyle.color,
        shapeClassName || DailyViewStyle.shape,
        animationClassName || DailyViewStyle.animation,
        className,
      )}
    >
      {/* Controles superiores */}
      <ContentHeader
        title={formatDate(selectedDate)}
        action={
          <div className="flex gap-(--size-m)">
            <Button onClick={prevDay}>Anterior</Button>
            <Button onClick={goToToday}>Hoy</Button>
            <Button onClick={nextDay}>Siguiente</Button>
          </div>
        }
      />

      {/* Selector de días de la semana */}
      <WeekSelector
        weekDays={weekDays}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onPrevWeek={prevWeek}
        onNextWeek={nextWeek}
        weekDaysNames={WEEK_DAYS}
        isSameDay={isSameDay}
      />

      {/* Agenda diaria (Bloques horarios) */}
      <div className="flex flex-col border border-black">
        {hours.map((hour, index) => {
          // Mostrar un turno de ejemplo diferente según el día seleccionado para simular datos reales
          const hasEvent = (selectedDate.getDate() + index) % 4 === 0;

          return (
            <div key={hour} className="flex border-b border-black last:border-b-0 py-2 items-center">
              <div className="w-20 border-r border-black pr-4 text-right font-semibold">
                {hour}
              </div>
              <div className="flex-1 pl-4 flex gap-2">
                {hasEvent ? (
                  <div className="flex-1 border border-dashed border-black h-8 flex items-center justify-center text-sm">
                    Turno Reservado ({hour})
                  </div>
                ) : (
                  <div className="flex-1 h-8" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
}
