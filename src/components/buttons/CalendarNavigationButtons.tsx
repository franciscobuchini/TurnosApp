import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface CalendarNavigationButtonsProps {
  onPrevMonth?: (event: React.MouseEvent<HTMLElement>) => void;
  onNextMonth?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  buttonClassName?: string;
}

const CalendarNavigationButtonsClasses = {
  required: 'hidden group-open:flex gap-(--size-s)',
  style: '',
};

const CalendarActionButtonClasses = {
  required: 'h-(--size-xl) w-(--size-xl) justify-center items-center',
  style: 'bg-transparent text-white',
};

export default function CalendarNavigationButtons({
  onPrevMonth,
  onNextMonth,
  className,
  buttonClassName,
}: CalendarNavigationButtonsProps) {
  return (
    <div className={twMerge(CalendarNavigationButtonsClasses.required, CalendarNavigationButtonsClasses.style, className)}>
      <Button
        onClick={onPrevMonth}
        icon={<ChevronLeft size={"var(--size-m)"} />}
        className={twMerge(CalendarActionButtonClasses.required, CalendarActionButtonClasses.style, buttonClassName)}
      />
      <Button
        onClick={onNextMonth}
        icon={<ChevronRight size={"var(--size-m)"} />}
        className={twMerge(CalendarActionButtonClasses.required, CalendarActionButtonClasses.style, buttonClassName)}
      />
    </div>
  );
}
