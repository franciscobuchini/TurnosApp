import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

interface AddButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  text?: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const ADD_BUTTON_CLASS = 'w-full h-12 gap-4 shrink-0 justify-center text-neutral-400 hover:text-white rounded-2xl';

export default function AddButton({
  text,
  icon,
  className,
  onClick,
  ...props
}: AddButtonProps) {
  return (
    <Button
      {...props}
      variant="ghost"
      onClick={onClick}
      icon={icon !== undefined ? icon : <Plus size={16} />}
      text={text ?? 'Agregar'}
      className={twMerge(ADD_BUTTON_CLASS, className)}
    />
  );
}
