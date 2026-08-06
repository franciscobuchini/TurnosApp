import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';
import { getDayName, isSameDay } from '../../functions/dateName';

interface DaySelectorButtonsProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WEEK_SELECTOR_DAY_BUTTON_CLASS = 'h-(--size-6xl) flex-1 p-(--size-s) shrink-0 justify-center items-center bg-transparent';

const WEEK_SELECTOR_DAY_SELECTED_CLASS = 'bg-neutral-900 text-white';

const WEEK_SELECTOR_DAY_TODAY_CLASS = 'bg-white';

const WEEK_SELECTOR_DAY_VISIBILITY_0_CLASS = '';
const WEEK_SELECTOR_DAY_VISIBILITY_1_CLASS = 'hidden @min-[380px]:flex';
const WEEK_SELECTOR_DAY_VISIBILITY_2_CLASS = 'hidden @min-[620px]:flex';
const WEEK_SELECTOR_DAY_VISIBILITY_3_CLASS = 'hidden @min-[840px]:flex';
const WEEK_SELECTOR_DAY_VISIBILITY_CLASS: Record<number, string> = {
  0: WEEK_SELECTOR_DAY_VISIBILITY_0_CLASS,
  1: WEEK_SELECTOR_DAY_VISIBILITY_1_CLASS,
  2: WEEK_SELECTOR_DAY_VISIBILITY_2_CLASS,
  3: WEEK_SELECTOR_DAY_VISIBILITY_3_CLASS,
};

const WEEK_SELECTOR_DAY_COLUMN_CLASS = 'flex flex-col items-center';

const WEEK_SELECTOR_DAY_LABEL_CLASS = 'text-l';

const WEEK_SELECTOR_DAY_NUMBER_CLASS = 'text-4xl font-semibold px-(--size-2xs)';

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
        const visibilityClassName = WEEK_SELECTOR_DAY_VISIBILITY_CLASS[distance];

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
            className={twMerge(WEEK_SELECTOR_DAY_BUTTON_CLASS,
              visibilityClassName,
              isSelected
                ? WEEK_SELECTOR_DAY_SELECTED_CLASS
                : isToday
                  ? WEEK_SELECTOR_DAY_TODAY_CLASS
                  : '',
            )}
          >
            <span className={WEEK_SELECTOR_DAY_COLUMN_CLASS}>
              <span className={WEEK_SELECTOR_DAY_LABEL_CLASS}>
                {getDayName(date)}
              </span>
              <span className={WEEK_SELECTOR_DAY_NUMBER_CLASS}>
                {date.getDate()}
              </span>
            </span>
          </Button>
        );
      })}
    </>
  );
}
