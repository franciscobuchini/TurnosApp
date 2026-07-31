import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';
import Icon from '../interface/Icon';
import { getDayName, getMonthName, isSameDay } from '../../functions/dateName';

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

/* WeekSelectorClasses*/
const WeekSelectorClasses = {
  required: 'flex w-full items-center justify-between',
  style: '',
};

/* WeekSelectorDaysClasses: wrapper de los 7 botones de día */
const WeekSelectorDaysClasses = {
  required: 'flex flex-1 justify-around gap-(--size-xs) px-(--size-xs)',
  style: '',
};

/* WeekSelectorNavButtonClasses: botones de flecha prev/next, comparten el mismo look */
const WeekSelectorNavButtonClasses = {
  required: 'h-(--size-6xl)',
  style: '',
};

/* WeekSelectorDayButtonClasses: botones de día, pasado como prop height a Button */
const WeekSelectorDayButtonClasses = {
  required: 'h-(--size-6xl) flex-1',
  style: '',
};

/* WeekSelectorDayContentClasses: layout interno del botón de día (label, número, mes apilados) */
const WeekSelectorDayContentClasses = {
  required: 'gap-(--size-xs)',
  style: '',
};

/* WeekSelectorDaySelectedClasses: estado activo del botón de día, pisa el style default de Button */
const WeekSelectorDaySelectedClasses = {
  required: '',
  style: 'bg-black text-white rounded-xl',
};

/* WeekSelectorDayLabelClasses: label de 3 letras (Lun, Mar, Mié...), más chico que el número */
const WeekSelectorDayLabelClasses = {
  required: 'text-l',
  style: '',
};

/* WeekSelectorDayMonthClasses: label de 3 letras del mes (Ene, Feb, Mar...), más chico que el día */
const WeekSelectorDayMonthClasses = {
  required: 'text-l',
  style: '',
};

/* WeekSelectorDayNumberClasses: número del día, mucho más grande que el label */
const WeekSelectorDayNumberClasses = {
  required: 'text-5xl font-semibold',
  style: '',
};

export default function WeekSelector({
  weekDays,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  className,
  prevButtonClassName,
  nextButtonClassName,
}: WeekSelectorProps) {
  return (
    <div className={twMerge(WeekSelectorClasses.required, WeekSelectorClasses.style, className)}>
      <Button
        onClick={onPrevWeek}
        className={twMerge(WeekSelectorNavButtonClasses.required, WeekSelectorNavButtonClasses.style, prevButtonClassName)}
      >
        <Icon name="ChevronLeft" />
      </Button>

      <div className={twMerge(WeekSelectorDaysClasses.required, WeekSelectorDaysClasses.style)}>
        {weekDays.map((date, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <Button
              key={idx}
              onClick={() => onSelectDate(date)}
              height="h-(--size-6xl)"
              contentClassName={twMerge(WeekSelectorDayContentClasses.required, WeekSelectorDayContentClasses.style)}
              className={twMerge(
                WeekSelectorDayButtonClasses.required,
                WeekSelectorDayButtonClasses.style,
                isSelected &&
                  twMerge(WeekSelectorDaySelectedClasses.required, WeekSelectorDaySelectedClasses.style),
              )}
            >
              <span className={twMerge(WeekSelectorDayLabelClasses.required, WeekSelectorDayLabelClasses.style)}>
                {getDayName(date, 3)}
              </span>
              <span className={twMerge(WeekSelectorDayNumberClasses.required, WeekSelectorDayNumberClasses.style)}>
                {date.getDate()}
              </span>
              <span className={twMerge(WeekSelectorDayMonthClasses.required, WeekSelectorDayMonthClasses.style)}>
                {getMonthName(date, 3)}
              </span>
            </Button>
          );
        })}
      </div>

      <Button
        onClick={onNextWeek}
        className={twMerge(WeekSelectorNavButtonClasses.required, WeekSelectorNavButtonClasses.style, nextButtonClassName)}
      >
        <Icon name="ChevronRight" />
      </Button>
    </div>
  );
}