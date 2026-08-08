import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface ConfirmButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const CONFIRM_BUTTON_CLASS = 'rounded-2xl bg-neutral-100 px-(--size-l) py-(--size-s) text-neutral-900';

export default function ConfirmButton({ text, disabled, className, onClick, ...props }: ConfirmButtonProps) {
  return (
    <Button
      {...props}
      onClick={onClick}
      text={text}
      disabled={disabled}
      className={twMerge(CONFIRM_BUTTON_CLASS, className)}
    />
  );
}