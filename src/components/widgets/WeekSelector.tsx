/* 
  src/components/widgets/WeekSelector.tsx
*/

import { twMerge } from 'tailwind-merge';
import { NextWeekButton, PrevWeekButton } from '../buttons/WeekNavigationButtons';
import DaySelectorButtons from '../buttons/DaySelectorButtons';

interface WeekSelectorProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
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


export default function WeekSelector({
  weekDays,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  className,
}: WeekSelectorProps) {
  const normalizedSelectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const firstWeekDay = new Date(weekDays[0].getFullYear(), weekDays[0].getMonth(), weekDays[0].getDate());
  const lastWeekDay = new Date(weekDays[weekDays.length - 1].getFullYear(), weekDays[weekDays.length - 1].getMonth(), weekDays[weekDays.length - 1].getDate());
  const isSelectedBeforeWeek = normalizedSelectedDate < firstWeekDay;
  const isSelectedAfterWeek = normalizedSelectedDate > lastWeekDay;

  return (
    <div className={twMerge(WeekSelectorClasses.required, WeekSelectorClasses.style, className)}>
      <PrevWeekButton
        onClick={onPrevWeek}
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
        onClick={onNextWeek}
        isSelected={isSelectedAfterWeek}
      />
    </div>
  );
}