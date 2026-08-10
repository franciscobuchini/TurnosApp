import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

interface DeleteButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const DELETE_BUTTON_CLASS = 'h-12 rounded-2xl px-8 text-base';

export default function DeleteButton({ text, className, onClick, ...props }: DeleteButtonProps) {
  return (
    <Button
      {...props}
      variant="destructive"
      onClick={onClick}
      text={text}
      className={twMerge(DELETE_BUTTON_CLASS, className)}
    />
  );
}