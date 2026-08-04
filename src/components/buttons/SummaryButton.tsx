import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SummaryButtonProps {
  className?: string;
  iconClassName?: string;
}

const SummaryButtonClasses = {
  required: 'transition-transform duration-200 group-open:rotate-180',
  style: 'text-white',
};

export default function SummaryButton({
  className,
  iconClassName,
}: SummaryButtonProps) {
  return (
    <ChevronDown
      className={twMerge(SummaryButtonClasses.required, SummaryButtonClasses.style, className, iconClassName)}
      size={"var(--size-m)"}
    />
  );
}
