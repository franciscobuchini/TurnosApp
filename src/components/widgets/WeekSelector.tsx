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
  sizeClassName?: string;
  colorClassName?: string;
  shapeClassName?: string;
  animationClassName?: string;
}

const WeekSelectorStyle = {
  base: 'flex items-center justify-between',
  size: 'p-(--size-xs)',
  color: 'border border-black',
  shape: '',
  animation: '',
};

export default function WeekSelector({
  weekDays,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  weekDaysNames,
  isSameDay,
  className,
  sizeClassName,
  colorClassName,
  shapeClassName,
  animationClassName,
}: WeekSelectorProps) {
  return (
    <div
      className={twMerge(
        WeekSelectorStyle.base,
        sizeClassName || WeekSelectorStyle.size,
        colorClassName || WeekSelectorStyle.color,
        shapeClassName || WeekSelectorStyle.shape,
        animationClassName || WeekSelectorStyle.animation,
        className,
      )}
    >
      <Button onClick={onPrevWeek} className="p-(--size-s)">
        <Icon name="ChevronLeft" />
      </Button>

      <div className="flex flex-1 justify-around mx-4 gap-1">
        {weekDays.map((date, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <Button
              key={idx}
              onClick={() => onSelectDate(date)}
              colorClassName={isSelected ? 'bg-black text-white' : undefined}
            >
              <span className="text-xs">{weekDaysNames[idx]}</span>
              <span className="text-sm">{date.getDate()}</span>
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
