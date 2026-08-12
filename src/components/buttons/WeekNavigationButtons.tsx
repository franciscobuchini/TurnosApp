import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';
import { weekSelectorStateClass } from './weekSelectorButtonState';

interface WeekNavigationButtonProps {
  onClick: () => void;
  className?: string;
  isSelected?: boolean;
  isToday?: boolean;
}

const WEEK_SELECTOR_NAV_BUTTON_CLASS = 'h-24 w-16 shrink-0 justify-center items-center rounded-2xl';

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
  return (
    <Button
      onClick={onClick}
      icon={direction === 'prev' ? <ChevronLeft /> : <ChevronRight />}
      className={twMerge(WEEK_SELECTOR_NAV_BUTTON_CLASS, weekSelectorStateClass(isSelected, isToday), className)}
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
