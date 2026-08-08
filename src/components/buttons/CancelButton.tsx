import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface CancelButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const CANCEL_BUTTON_CLASS = 'rounded-2xl bg-transparent px-(--size-l) py-(--size-s) text-neutral-100';

export default function CancelButton({ text, className, onClick, ...props }: CancelButtonProps) {
  return (
    <Button
      {...props}
      onClick={onClick}
      text={text}
      className={twMerge(CANCEL_BUTTON_CLASS, className)}
    />
  );
}