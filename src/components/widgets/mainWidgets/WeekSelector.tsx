/*
  src/components/widgets/WeekSelector.tsx
*/

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { NextWeekButton, PrevWeekButton } from '../../buttons/WeekNavigationButtons';
import DaySelectorButtons from '../../buttons/DaySelectorButtons';

interface WeekSelectorProps {
  viewDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onViewDateChange: (date: Date) => void;
  blockModeOpen?: boolean;
  onToggleBusinessDayBlock?: (date: Date) => void;
  className?: string;
  prevButtonClassName?: string;
  nextButtonClassName?: string;
}

const WEEK_SELECTOR_CLASS = 'flex w-full items-center justify-between overflow-hidden bg-card rounded-3xl p-2';

const WEEK_SELECTOR_DAYS_CLASS = '@container flex flex-1 justify-around gap-2 px-2';

/* Sentido opuesto al contenido del Schedule a propósito (ver
   SCHEDULE_SLIDE_FROM_*_CLASS en Schedule.tsx, que hace exactamente lo
   inverso): acá, al avanzar (semana o día seleccionado) entra desde la
   izquierda, al retroceder entra desde la derecha. Se dispara con
   cualquiera de los dos cambios — el botón prev/next semana sólo mueve
   viewDate; hacer click en un día del selector sólo mueve selectedDate —
   para que "cambiar de día o de semana" tenga el mismo feedback acá,
   aunque sea distinto (invertido) del que usa el contenido del Schedule. */
const WEEK_SELECTOR_SLIDE_FROM_RIGHT_CLASS = 'animate-in fade-in-0 slide-in-from-right-8 duration-200';
const WEEK_SELECTOR_SLIDE_FROM_LEFT_CLASS = 'animate-in fade-in-0 slide-in-from-left-8 duration-200';

/* getWeekDays: dado un día, devuelve 7 fechas centradas en él (3 antes, el día, 3 después) */
const getWeekDays = (date: Date): Date[] => {
  const week: Date[] = [];
  for (let offset = -3; offset <= 3; offset++) {
    const next = new Date(date);
    next.setDate(date.getDate() + offset);
    week.push(next);
  }
  return week;
};

export default function WeekSelector({
  viewDate,
  selectedDate,
  onSelectDate,
  onViewDateChange,
  blockModeOpen,
  onToggleBusinessDayBlock,
  className,
}: WeekSelectorProps) {
  /* Misma técnica que Schedule.tsx (ver previousSelectedDate ahí): se
     compara contra el valor anterior DURANTE el render (no en un efecto)
     para que la clase de animación ya esté lista en el primer commit con
     el nuevo dato — un efecto la aplicaría un frame tarde, después de que
     React ya pintó el contenido en su posición final, y no se vería nada.
     No dispara en el primer render (arrancan iguales) ni en re-renders por
     otros motivos (cambiar de mes en un datepicker aparte, etc.). */
  const [previousViewDate, setPreviousViewDate] = useState(viewDate);
  const [previousSelectedDate, setPreviousSelectedDate] = useState(selectedDate);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const viewDateChanged = previousViewDate.getTime() !== viewDate.getTime();
  const selectedDateChanged = previousSelectedDate.getTime() !== selectedDate.getTime();
  if (viewDateChanged || selectedDateChanged) {
    // Prioriza el cambio de semana (más "grande") si ambos cambiaron a la vez.
    const reference = viewDateChanged ? previousViewDate : previousSelectedDate;
    const next = viewDateChanged ? viewDate : selectedDate;
    setSlideDirection(next.getTime() < reference.getTime() ? 'left' : 'right');
    setPreviousViewDate(viewDate);
    setPreviousSelectedDate(selectedDate);
  }

  const weekDays = getWeekDays(viewDate);
  const normalizedSelectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const firstWeekDay = new Date(weekDays[0].getFullYear(), weekDays[0].getMonth(), weekDays[0].getDate());
  const lastWeekDay = new Date(weekDays[weekDays.length - 1].getFullYear(), weekDays[weekDays.length - 1].getMonth(), weekDays[weekDays.length - 1].getDate());
  
  const isSelectedBeforeWeek = normalizedSelectedDate < firstWeekDay;
  const isSelectedAfterWeek = normalizedSelectedDate > lastWeekDay;

  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isTodayBeforeWeek = normalizedToday < firstWeekDay;
  const isTodayAfterWeek = normalizedToday > lastWeekDay;

  const prevWeek = () => {
    const next = new Date(viewDate);
    next.setDate(viewDate.getDate() - 7);
    onViewDateChange(next);
  };

  const nextWeek = () => {
    const next = new Date(viewDate);
    next.setDate(viewDate.getDate() + 7);
    onViewDateChange(next);
  };

  return (
    <div className={twMerge(WEEK_SELECTOR_CLASS, className)}>
      <PrevWeekButton
        onClick={prevWeek}
        isSelected={isSelectedBeforeWeek}
        isToday={isTodayBeforeWeek}
      />

      <div
        key={`${viewDate.getTime()}_${selectedDate.getTime()}`}
        className={twMerge(
          WEEK_SELECTOR_DAYS_CLASS,
          slideDirection === 'left' && WEEK_SELECTOR_SLIDE_FROM_LEFT_CLASS,
          slideDirection === 'right' && WEEK_SELECTOR_SLIDE_FROM_RIGHT_CLASS,
        )}
      >
        <DaySelectorButtons
          weekDays={weekDays}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          blockModeOpen={blockModeOpen}
          onToggleBusinessDayBlock={onToggleBusinessDayBlock}
        />
      </div>

      <NextWeekButton
        onClick={nextWeek}
        isSelected={isSelectedAfterWeek}
        isToday={isTodayAfterWeek}
      />
    </div>
  );
}
