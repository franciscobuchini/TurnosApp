import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

interface DetailsButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const DETAILS_BUTTON_CLASS = 'justify-between w-full h-8 p-3 gap-6 text-neutral-400 hover:text-white';

export default function DetailsButton({
  text,
  icon,
  className,
  onClick,
  ...props
}: DetailsButtonProps) {
  return (
    <Button
      {...props}
      variant="ghost"
      onClick={onClick}
      text={text}
      icon={icon ?? <ChevronRight size={16} />}
      className={twMerge(DETAILS_BUTTON_CLASS, className)}
    />
  );
}
