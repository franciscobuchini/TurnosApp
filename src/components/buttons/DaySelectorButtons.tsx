import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';
import { getOpeningHours } from '@/database/data';
import { getBusinessHoursByDay } from '@/hooks/useWeekSchedule';
import { isBusinessDayAnyUnblocked, isBusinessDayFullyBlocked } from '@/functions/scheduleCellAvailability';
import { useLayoutTier } from '@/hooks/useLayoutTier';
import { getDayName, isSameDay } from '@/utils/dateName';
import { weekSelectorStateClass } from './weekSelectorButtonState';

interface DaySelectorButtonsProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WEEK_SELECTOR_DAY_BUTTON_CLASS = 'flex-1 shrink-0 justify-center items-center bg-transparent rounded-3xl';
/* h-24/p-3 en pc, mitad en mobile (h-12/p-1) — ver WeekSelector.tsx (el
   padding del contenedor baja a la par) y WEEK_SELECTOR_DAY_LABEL/NUMBER_
   *_MOBILE_CLASS de acá abajo (el texto también se achica, si no no entra
   en la mitad del alto). */
const WEEK_SELECTOR_DAY_BUTTON_PC_CLASS = 'h-24 p-3';
const WEEK_SELECTOR_DAY_BUTTON_MOBILE_CLASS = 'h-12 p-1';

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
const WEEK_SELECTOR_DAY_LABEL_MOBILE_CLASS = 'text-[10px] font-normal';

const WEEK_SELECTOR_DAY_NUMBER_CLASS = 'text-5xl px-1';
const WEEK_SELECTOR_DAY_NUMBER_MOBILE_CLASS = 'text-xl px-1';

function daySelectorNoHoverClass(isSelected: boolean, isToday: boolean, isDayOff: boolean): string {
  if (isSelected) return 'hover:bg-muted hover:text-foreground';
  if (isToday) return 'hover:bg-transparent hover:text-foreground';
  if (isDayOff) return 'hover:bg-transparent hover:text-muted-foreground/25';
  return 'hover:bg-transparent hover:text-muted-foreground';
}

export default function DaySelectorButtons({
  weekDays,
  selectedDate,
  onSelectDate,
}: DaySelectorButtonsProps) {
  const tier = useLayoutTier();
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
              tier === 'mobile' ? WEEK_SELECTOR_DAY_BUTTON_MOBILE_CLASS : WEEK_SELECTOR_DAY_BUTTON_PC_CLASS,
              visibilityClassName,
              weekSelectorStateClass(isSelected, isToday, isDayOff),
              daySelectorNoHoverClass(isSelected, isToday, isDayOff),
            )}
          >
            <span className={WEEK_SELECTOR_DAY_COLUMN_CLASS}>
              <span className={tier === 'mobile' ? WEEK_SELECTOR_DAY_LABEL_MOBILE_CLASS : WEEK_SELECTOR_DAY_LABEL_CLASS}>
                {getDayName(date)}
              </span>
              <span className={tier === 'mobile' ? WEEK_SELECTOR_DAY_NUMBER_MOBILE_CLASS : WEEK_SELECTOR_DAY_NUMBER_CLASS}>
                {date.getDate()}
              </span>
            </span>
          </Button>
        );
      })}
    </>
  );
}
