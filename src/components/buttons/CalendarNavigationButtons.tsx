import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

interface CalendarNavigationButtonsProps {
  onPrevMonth?: (event: React.MouseEvent<HTMLElement>) => void;
  onNextMonth?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  buttonClassName?: string;
}

const CALENDAR_NAVIGATION_BUTTONS_CLASS = 'flex gap-3';

const CALENDAR_ACTION_BUTTON_CLASS = 'h-8 w-8 p-0 justify-center items-center bg-transparent hover:bg-transparent text-foreground';

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
        icon={<ChevronLeft size={16} />}
        className={twMerge(CALENDAR_ACTION_BUTTON_CLASS, buttonClassName)}
      />
      <Button
        onClick={onNextMonth}
        icon={<ChevronRight size={16} />}
        className={twMerge(CALENDAR_ACTION_BUTTON_CLASS, buttonClassName)}
      />
    </div>
  );
}
