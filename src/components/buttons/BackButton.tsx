import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface BackButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  icon?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const BACK_BUTTON_CLASS = 'h-(--size-2xl) w-(--size-2xl) bg-transparent p-0 text-neutral-100';

export default function BackButton({
  icon,
  className,
  onClick,
  ...props
}: BackButtonProps) {
  return (
    <Button
      {...props}
      onClick={onClick}
      icon={icon ?? <ChevronLeft size="var(--size-l)" />}
      className={twMerge(BACK_BUTTON_CLASS, className)}
      aria-label="Volver"
    />
  );
}