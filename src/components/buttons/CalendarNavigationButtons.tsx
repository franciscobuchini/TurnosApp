import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface CalendarNavigationButtonsProps {
  onPrevMonth?: (event: React.MouseEvent<HTMLElement>) => void;
  onNextMonth?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  buttonClassName?: string;
}

const CALENDAR_NAVIGATION_BUTTONS_CLASS = 'hidden group-open:flex gap-(--size-s)';

const CALENDAR_ACTION_BUTTON_CLASS = 'h-(--size-xl) w-(--size-xl) justify-center items-center bg-transparent text-white';

export default function CalendarNavigationButtons({
  onPrevMonth,
  onNextMonth,
  className,
  buttonClassName,
}: CalendarNavigationButtonsProps) {
  return (
    <div className={twMerge(CALENDAR_NAVIGATION_BUTTONS_CLASS, className)}>
      <Button
        onClick={onPrevMonth}
        icon={<ChevronLeft size={"var(--size-m)"} />}
        className={twMerge(CALENDAR_ACTION_BUTTON_CLASS, buttonClassName)}
      />
      <Button
        onClick={onNextMonth}
        icon={<ChevronRight size={"var(--size-m)"} />}
        className={twMerge(CALENDAR_ACTION_BUTTON_CLASS, buttonClassName)}
      />
    </div>
  );
}
