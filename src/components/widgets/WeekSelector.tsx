import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';
import Icon from '../interface/Icon';

interface WeekSelectorProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  weekDaysNames: string[];
  isSameDay: (date1: Date, date2: Date) => boolean;
  className?: string;
  styleClassName?: string;
}

/* WeekSelectorClasses:
   - required: estructura y tamaño. No varía.
   - style: color (borde). Esto sí se puede modificar. */
const WeekSelectorClasses = {
  required: 'flex items-center justify-between p-(--size-xs)',
  style: 'border border-black',
};

const WeekSelectorDaysRequired = 'flex flex-1 justify-around mx-4 gap-1';
const WeekSelectorDayLabelRequired = 'text-xs';
const WeekSelectorDayNumberRequired = 'text-sm';

export default function WeekSelector({
  weekDays,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  weekDaysNames,
  isSameDay,
  className,
  styleClassName,
}: WeekSelectorProps) {
  return (
    <div className={twMerge(WeekSelectorClasses.required, styleClassName || WeekSelectorClasses.style, className)}>
      <Button onClick={onPrevWeek} className="p-(--size-s)">
        <Icon name="ChevronLeft" />
      </Button>

      <div className={WeekSelectorDaysRequired}>
        {weekDays.map((date, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <Button
              key={idx}
              onClick={() => onSelectDate(date)}
              styleClassName={isSelected ? 'bg-black text-white' : undefined}
            >
              <span className={WeekSelectorDayLabelRequired}>{weekDaysNames[idx]}</span>
              <span className={WeekSelectorDayNumberRequired}>{date.getDate()}</span>
            </Button>
          );
        })}
      </div>

      <Button onClick={onNextWeek} className="p-(--size-s)">
        <Icon name="ChevronRight" />
      </Button>
    </div>
  );
}