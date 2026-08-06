import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface WeekNavigationButtonProps {
  onClick: () => void;
  className?: string;
  isSelected?: boolean;
}

const WEEK_SELECTOR_NAV_BUTTON_CLASS = 'h-(--size-6xl) w-(--size-4xl) shrink-0 justify-center items-center rounded-2xl bg-transparent';

const WEEK_SELECTOR_NAV_BUTTON_SELECTED_CLASS = 'bg-neutral-900 text-white';

export function PrevWeekButton({ onClick, className, isSelected = false }: WeekNavigationButtonProps) {
  return (
    <Button
      onClick={onClick}
      icon={<ChevronLeft />}
      className={twMerge(WEEK_SELECTOR_NAV_BUTTON_CLASS,
        isSelected ? WEEK_SELECTOR_NAV_BUTTON_SELECTED_CLASS : '',
        className,
      )}
    />
  );
}

export function NextWeekButton({ onClick, className, isSelected = false }: WeekNavigationButtonProps) {
  return (
    <Button
      onClick={onClick}
      icon={<ChevronRight />}
      className={twMerge(WEEK_SELECTOR_NAV_BUTTON_CLASS,
        isSelected ? WEEK_SELECTOR_NAV_BUTTON_SELECTED_CLASS : '',
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
  className,
  prevButtonClassName,
  nextButtonClassName,
}: {
  onPrevWeek: () => void;
  onNextWeek: () => void;
  isSelectedBeforeWeek?: boolean;
  isSelectedAfterWeek?: boolean;
  className?: string;
  prevButtonClassName?: string;
  nextButtonClassName?: string;
}) {
  return (
    <>
      <PrevWeekButton onClick={onPrevWeek} className={twMerge(prevButtonClassName, className)} isSelected={isSelectedBeforeWeek} />
      <NextWeekButton onClick={onNextWeek} className={twMerge(nextButtonClassName, className)} isSelected={isSelectedAfterWeek} />
    </>
  );
}
