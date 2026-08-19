import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';
import { useLayoutTier } from '@/hooks/useLayoutTier';
import { weekSelectorStateClass } from './weekSelectorButtonState';

interface WeekNavigationButtonProps {
  onClick: () => void;
  className?: string;
  isSelected?: boolean;
  isToday?: boolean;
}

const WEEK_SELECTOR_NAV_BUTTON_CLASS = 'shrink-0 justify-center items-center rounded-2xl';
/* pc: h-24, ancho fijo w-16 (rectangular). mobile: mismo h-12 que el
   botón del día (ver WEEK_SELECTOR_DAY_BUTTON_MOBILE_CLASS en
   DaySelectorButtons.tsx) pero cuadrado (aspect-square en vez de w-16
   fijo) — más chico que en pc y con el mismo aspecto que un botón de
   día, no una barra angosta. */
const WEEK_SELECTOR_NAV_BUTTON_PC_CLASS = 'h-24 w-16';
const WEEK_SELECTOR_NAV_BUTTON_MOBILE_CLASS = 'h-12 aspect-square';

/* PrevWeekButton/NextWeekButton son idénticos salvo el ícono — quedan como
   wrappers finos de este único botón interno para no tocar sus imports en
   WeekSelector.tsx. */
function WeekNavButton({
  direction,
  onClick,
  className,
  isSelected = false,
  isToday = false,
}: WeekNavigationButtonProps & { direction: 'prev' | 'next' }) {
  const tier = useLayoutTier();

  return (
    <Button
      onClick={onClick}
      icon={direction === 'prev' ? <ChevronLeft /> : <ChevronRight />}
      className={twMerge(
        WEEK_SELECTOR_NAV_BUTTON_CLASS,
        tier === 'mobile' ? WEEK_SELECTOR_NAV_BUTTON_MOBILE_CLASS : WEEK_SELECTOR_NAV_BUTTON_PC_CLASS,
        weekSelectorStateClass(isSelected, isToday),
        className,
      )}
    />
  );
}

export function PrevWeekButton(props: WeekNavigationButtonProps) {
  return <WeekNavButton direction="prev" {...props} />;
}

export function NextWeekButton(props: WeekNavigationButtonProps) {
  return <WeekNavButton direction="next" {...props} />;
}

export default function WeekNavigationButtons({
  onPrevWeek,
  onNextWeek,
  isSelectedBeforeWeek,
  isSelectedAfterWeek,
  isTodayBeforeWeek,
  isTodayAfterWeek,
  className,
  prevButtonClassName,
  nextButtonClassName,
}: {
  onPrevWeek: () => void;
  onNextWeek: () => void;
  isSelectedBeforeWeek?: boolean;
  isSelectedAfterWeek?: boolean;
  isTodayBeforeWeek?: boolean;
  isTodayAfterWeek?: boolean;
  className?: string;
  prevButtonClassName?: string;
  nextButtonClassName?: string;
}) {
  return (
    <>
      <PrevWeekButton onClick={onPrevWeek} className={twMerge(prevButtonClassName, className)} isSelected={isSelectedBeforeWeek} isToday={isTodayBeforeWeek} />
      <NextWeekButton onClick={onNextWeek} className={twMerge(nextButtonClassName, className)} isSelected={isSelectedAfterWeek} isToday={isTodayAfterWeek} />
    </>
  );
}
