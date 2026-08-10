import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

interface BackButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  icon?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const BACK_BUTTON_CLASS = 'h-12 w-12 p-0 text-neutral-100 hover:bg-transparent';

export default function BackButton({
  icon,
  className,
  onClick,
  ...props
}: BackButtonProps) {
  return (
    <Button
      {...props}
      variant="ghost"
      onClick={onClick}
      icon={icon ?? <ChevronLeft size={24} />}
      className={twMerge(BACK_BUTTON_CLASS, className)}
      aria-label="Volver"
    />
  );
}