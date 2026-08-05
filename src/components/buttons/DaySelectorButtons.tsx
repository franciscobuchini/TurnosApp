import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';
import { getDayName, isSameDay } from '../../functions/dateName';

interface DaySelectorButtonsProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WeekSelectorDayButtonClasses = {
  required: 'h-(--size-6xl) flex-1 p-(--size-s) shrink-0 justify-center items-center',
  style: '',
};

const WeekSelectorDaySelectedClasses = {
  required: '',
  style: 'bg-stone-900 text-white',
};

const WeekSelectorDayTodayClasses = {
  required: '',
  style: 'ring-2 ring-stone-900',
};

const WeekSelectorDayVisibilityClasses: Record<number, { required: string; style: string }> = {
  0: { required: '', style: '' },
  1: { required: 'hidden @min-[380px]:flex', style: '' },
  2: { required: 'hidden @min-[620px]:flex', style: '' },
  3: { required: 'hidden @min-[840px]:flex', style: '' },
};

const WeekSelectorDayColumnClasses = {
  required: 'flex flex-col items-center',
  style: '',
};

const WeekSelectorDayLabelClasses = {
  required: 'text-l',
  style: '',
};

const WeekSelectorDayNumberClasses = {
  required: 'text-4xl font-semibold px-(--size-2xs)',
  style: '',
};

export default function DaySelectorButtons({
  weekDays,
  selectedDate,
  onSelectDate,
}: DaySelectorButtonsProps) {
  const centerIdx = Math.floor(weekDays.length / 2);

  return (
    <>
      {weekDays.map((date, idx) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, new Date());
        const distance = Math.abs(idx - centerIdx);
        const visibility = WeekSelectorDayVisibilityClasses[distance];

        const handleDayClick = () => {
          onSelectDate(date);

          if (!isToday || !isSelected) return;

          window.requestAnimationFrame(() => {
            const timeline = document.querySelector<HTMLElement>('[data-current-time-line]');
            const scrollContainer = timeline?.closest<HTMLElement>('[data-schedule-scroll]');

            if (!timeline || !scrollContainer) return;

            const top = Math.max(0, timeline.offsetTop - scrollContainer.clientHeight * 0.1);
            scrollContainer.scrollTo({ top, behavior: 'smooth' });
          });
        };

        return (
          <Button
            key={idx}
            onClick={handleDayClick}
            className={twMerge(
              WeekSelectorDayButtonClasses.required,
              WeekSelectorDayButtonClasses.style,
              visibility.required,
              visibility.style,
              isSelected
                ? twMerge(WeekSelectorDaySelectedClasses.required, WeekSelectorDaySelectedClasses.style)
                : isToday
                  ? twMerge(WeekSelectorDayTodayClasses.required, WeekSelectorDayTodayClasses.style)
                  : '',
            )}
          >
            <span className={twMerge(WeekSelectorDayColumnClasses.required, WeekSelectorDayColumnClasses.style)}>
              <span className={twMerge(WeekSelectorDayLabelClasses.required, WeekSelectorDayLabelClasses.style)}>
                {getDayName(date)}
              </span>
              <span className={twMerge(WeekSelectorDayNumberClasses.required, WeekSelectorDayNumberClasses.style)}>
                {date.getDate()}
              </span>
            </span>
          </Button>
        );
      })}
    </>
  );
}
