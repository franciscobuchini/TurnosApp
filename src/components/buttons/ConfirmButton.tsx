import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

interface ConfirmButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const CONFIRM_BUTTON_CLASS = 'h-12 rounded-2xl px-8 text-base';

export default function ConfirmButton({ text, disabled, className, onClick, ...props }: ConfirmButtonProps) {
  return (
    <Button
      {...props}
      variant="default"
      onClick={onClick}
      text={text}
      disabled={disabled}
      className={twMerge(CONFIRM_BUTTON_CLASS, className)}
    />
  );
}