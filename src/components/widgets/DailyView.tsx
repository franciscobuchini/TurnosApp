/* 
  src/components/widgets/DailyView.tsx
  Vista diaria de la agenda, organizada por bloques horarios representados con bordes.
  Permite navegar por días de la semana y desplazarse por fechas.
*/

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from '../../components/interface/Box';
import WeekSelector from './WeekSelector';

interface DailyViewProps {
  className?: string;
  styleClassName?: string;
}

/* DailyViewClasses: contenedor (Box)*/
const DailyViewClasses = {
  required: 'flex flex-col gap-(--size-xl)',
  style: 'border border-black',
};

/* DailyViewGridClasses: wrapper de la grilla de horas*/
const DailyViewGridClasses = {
  required: 'flex flex-col',
  style: 'border border-black',
};

/* DailyViewRowClasses: cada fila de hora*/
const DailyViewRowClasses = {
  required: 'flex py-2 items-center',
  style: 'border-b border-black last:border-b-0',
};

/* DailyViewRowLabelClasses: la etiqueta de la hora*/
const DailyViewRowLabelClasses = {
  required: 'w-20 pr-4 text-right font-semibold',
  style: 'border-r border-black',
};

/* DailyViewRowSlotClasses: wrapper del contenido de cada fila*/
const DailyViewRowSlotClasses = {
  required: 'flex-1 pl-4 flex gap-2',
  style: '',
};

/* DailyViewEventBadgeClasses: el bloque de "Turno Reservado"*/
const DailyViewEventBadgeClasses = {
  required: 'flex-1 h-8 flex items-center justify-center text-sm',
  style: 'border border-dashed border-black',
};

/* DailyViewEmptySlotClasses: el espacio vacío cuando no hay turno*/
const DailyViewEmptySlotClasses = {
  required: 'flex-1 h-8',
  style: '',
};

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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

export default function DailyView({ className, styleClassName }: DailyViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const weekDays = getWeekDays(selectedDate);

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
        DailyViewClasses.required,
        styleClassName || DailyViewClasses.style,
        className,
      )}
    >

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
      <div className={twMerge(DailyViewGridClasses.required, DailyViewGridClasses.style)}>
        {hours.map((hour, index) => {
          // Mostrar un turno de ejemplo diferente según el día seleccionado para simular datos reales
          const hasEvent = (selectedDate.getDate() + index) % 4 === 0;

          return (
            <div key={hour} className={twMerge(DailyViewRowClasses.required, DailyViewRowClasses.style)}>
              <div className={twMerge(DailyViewRowLabelClasses.required, DailyViewRowLabelClasses.style)}>
                {hour}
              </div>
              <div className={twMerge(DailyViewRowSlotClasses.required, DailyViewRowSlotClasses.style)}>
                {hasEvent ? (
                  <div className={twMerge(DailyViewEventBadgeClasses.required, DailyViewEventBadgeClasses.style)}>
                    Turno Reservado ({hour})
                  </div>
                ) : (
                  <div className={twMerge(DailyViewEmptySlotClasses.required, DailyViewEmptySlotClasses.style)} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
}