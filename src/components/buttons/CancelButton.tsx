import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

interface CancelButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const CANCEL_BUTTON_CLASS = 'h-12 rounded-2xl px-8 text-base text-neutral-100';

export default function CancelButton({ text, className, onClick, ...props }: CancelButtonProps) {
  return (
    <Button
      {...props}
      variant="ghost"
      onClick={onClick}
      text={text}
      className={twMerge(CANCEL_BUTTON_CLASS, className)}
    />
  );
}