import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

interface WeekNavigationButtonProps {
  onClick: () => void;
  className?: string;
  isSelected?: boolean;
  isToday?: boolean;
}

const WEEK_SELECTOR_NAV_BUTTON_CLASS = 'h-24 w-16 shrink-0 justify-center items-center rounded-2xl';

/* Sin colores de paleta acá: chocaban visualmente con los colores de
   servicio de las tarjetas de turnos. Los 3 estados se distinguen solo con
   grises/bordes del theme (--muted, --border, --foreground), que ya son
   claros/oscuros automáticamente según el tema activo. */
const WEEK_SELECTOR_NAV_BUTTON_DEFAULT_CLASS = 'bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground';

const WEEK_SELECTOR_NAV_BUTTON_TODAY_CLASS = 'bg-transparent border border-border text-foreground hover:bg-muted/60';

const WEEK_SELECTOR_NAV_BUTTON_SELECTED_CLASS = 'bg-muted border border-foreground/15 text-foreground hover:bg-muted';

export function PrevWeekButton({ onClick, className, isSelected = false, isToday = false }: WeekNavigationButtonProps) {
  return (
    <Button
      onClick={onClick}
      icon={<ChevronLeft />}
      className={twMerge(WEEK_SELECTOR_NAV_BUTTON_CLASS,
        isSelected
          ? WEEK_SELECTOR_NAV_BUTTON_SELECTED_CLASS
          : isToday
            ? WEEK_SELECTOR_NAV_BUTTON_TODAY_CLASS
            : WEEK_SELECTOR_NAV_BUTTON_DEFAULT_CLASS,
        className,
      )}
    />
  );
}

export function NextWeekButton({ onClick, className, isSelected = false, isToday = false }: WeekNavigationButtonProps) {
  return (
    <Button
      onClick={onClick}
      icon={<ChevronRight />}
      className={twMerge(WEEK_SELECTOR_NAV_BUTTON_CLASS,
        isSelected
          ? WEEK_SELECTOR_NAV_BUTTON_SELECTED_CLASS
          : isToday
            ? WEEK_SELECTOR_NAV_BUTTON_TODAY_CLASS
            : WEEK_SELECTOR_NAV_BUTTON_DEFAULT_CLASS,
        className,
      )}
    />
  );
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
