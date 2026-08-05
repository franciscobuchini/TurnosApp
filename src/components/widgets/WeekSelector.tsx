/* 
  src/components/widgets/WeekSelector.tsx
*/

import { twMerge } from 'tailwind-merge';
import { NextWeekButton, PrevWeekButton } from '../buttons/WeekNavigationButtons';
import DaySelectorButtons from '../buttons/DaySelectorButtons';

interface WeekSelectorProps {
  viewDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onViewDateChange: (date: Date) => void;
  className?: string;
  prevButtonClassName?: string;
  nextButtonClassName?: string;
}

/* Wrapper de los 7 botones de día + los botones de navegación */
const WeekSelectorClasses = {
  required: 'flex w-full items-center justify-between',
  style: '',
};

/* Wrapper de los 7 botones de día */
const WeekSelectorDaysClasses = {
  required: '@container flex flex-1 justify-around gap-(--size-xs) px-(--size-xs)',
  style: '',
};

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
  className,
}: WeekSelectorProps) {
  const weekDays = getWeekDays(viewDate);
  const normalizedSelectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const firstWeekDay = new Date(weekDays[0].getFullYear(), weekDays[0].getMonth(), weekDays[0].getDate());
  const lastWeekDay = new Date(weekDays[weekDays.length - 1].getFullYear(), weekDays[weekDays.length - 1].getMonth(), weekDays[weekDays.length - 1].getDate());
  const isSelectedBeforeWeek = normalizedSelectedDate < firstWeekDay;
  const isSelectedAfterWeek = normalizedSelectedDate > lastWeekDay;

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
    <div className={twMerge(WeekSelectorClasses.required, WeekSelectorClasses.style, className)}>
      <PrevWeekButton
        onClick={prevWeek}
        isSelected={isSelectedBeforeWeek}
      />

      <div className={twMerge(WeekSelectorDaysClasses.required, WeekSelectorDaysClasses.style)}>
        <DaySelectorButtons
          weekDays={weekDays}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      </div>

      <NextWeekButton
        onClick={nextWeek}
        isSelected={isSelectedAfterWeek}
      />
    </div>
  );
}
