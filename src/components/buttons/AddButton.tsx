import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface AddButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  text?: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const AddButtonClasses = {
  required: 'w-full h-(--size-2xl) gap-(--size-m) shrink-0 justify-center',
  style: 'bg-transparent text-gray-400 hover:text-white',
};

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
      onClick={onClick}
      icon={icon !== undefined ? icon : <Plus size={"var(--size-m)"} />}
      text={text ?? 'Agregar'}
      className={twMerge(AddButtonClasses.required, AddButtonClasses.style, className)}
    />
  );
}
