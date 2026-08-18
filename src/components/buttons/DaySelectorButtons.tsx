import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';
import { getOpeningHours } from '@/database/data';
import { getBusinessHoursByDay } from '@/hooks/useWeekSchedule';
import { isBusinessDayAnyUnblocked, isBusinessDayFullyBlocked } from '@/functions/scheduleCellAvailability';
import { getDayName, isSameDay } from '@/utils/dateName';
import { weekSelectorStateClass } from './weekSelectorButtonState';

interface DaySelectorButtonsProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  blockModeOpen?: boolean;
  onToggleBusinessDayBlock?: (date: Date) => void;
}

const WEEK_SELECTOR_DAY_BUTTON_CLASS = 'h-24 flex-1 p-3 shrink-0 justify-center items-center bg-transparent rounded-3xl';

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

const WEEK_SELECTOR_DAY_LABEL_CLASS = 'text-l font-normal';

const WEEK_SELECTOR_DAY_NUMBER_CLASS = 'text-5xl px-1';

export default function DaySelectorButtons({
  weekDays,
  selectedDate,
  onSelectDate,
  blockModeOpen = false,
  onToggleBusinessDayBlock,
}: DaySelectorButtonsProps) {
  const centerIdx = Math.floor(weekDays.length / 2);
  /* Horario del negocio por día de semana — para apagar los días sin
     ningún tramo de apertura ("día libre") o bloqueados enteros a mano
     ("Bloquear día del negocio") y distinguirlos de los días normales,
     mismo criterio que ya usa Schedule.tsx (businessRanges vacío =
     cerrado; isBusinessDayFullyBlocked, ver más abajo). */
  const hoursByDay = getBusinessHoursByDay(getOpeningHours());

  return (
    <>
      {weekDays.map((date, idx) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, new Date());
        const isDayOff = ((hoursByDay[date.getDay()] ?? []).length === 0 || isBusinessDayFullyBlocked(date)) && !isBusinessDayAnyUnblocked(date);
        const distance = Math.abs(idx - centerIdx);
        const visibilityClassName = WEEK_SELECTOR_DAY_VISIBILITY_CLASS[distance];

        const handleDayClick = () => {
          onSelectDate(date);

          if (blockModeOpen && onToggleBusinessDayBlock) {
            onToggleBusinessDayBlock(date);
            return;
          }

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
              WEEK_SELECTOR_DAY_BUTTON_CLASS,
              visibilityClassName,
              weekSelectorStateClass(isSelected, isToday, isDayOff),
              blockModeOpen && (isDayOff ? 'hover:bg-(--palette-01)/30 cursor-pointer ring-1 ring-(--palette-01)/50' : 'hover:bg-destructive/30 cursor-pointer ring-1 ring-destructive/40'),
            )}
            title={blockModeOpen ? (isDayOff ? 'Desbloquear día completo del negocio' : 'Bloquear día completo del negocio') : undefined}
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
