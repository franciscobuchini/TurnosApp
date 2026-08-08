import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface DeleteButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const DELETE_BUTTON_CLASS = 'rounded-2xl bg-red-500 px-(--size-l) py-(--size-s) text-white';

export default function DeleteButton({ text, className, onClick, ...props }: DeleteButtonProps) {
  return (
    <Button
      {...props}
      onClick={onClick}
      text={text}
      className={twMerge(DELETE_BUTTON_CLASS, className)}
    />
  );
}