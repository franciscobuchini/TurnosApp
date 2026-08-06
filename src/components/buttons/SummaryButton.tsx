import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SummaryButtonProps {
  className?: string;
  iconClassName?: string;
}

const SUMMARY_BUTTON_CLASS = 'transition-transform duration-200 group-open:rotate-180 text-white';

export default function SummaryButton({
  className,
  iconClassName,
}: SummaryButtonProps) {
  return (
    <ChevronDown
      className={twMerge(SUMMARY_BUTTON_CLASS, className, iconClassName)}
      size={"var(--size-m)"}
    />
  );
}
