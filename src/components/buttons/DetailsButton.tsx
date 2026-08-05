import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface DetailsButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const DetailsButtonClasses = {
  required: 'justify-between w-full h-(--size-xl) p-(--size-s) gap-(--size-l)',
  style: 'bg-transparent text-gray-400 hover:text-white',
};

export default function DetailsButton({
  text,
  icon,
  className,
  onClick,
  ...props
}: DetailsButtonProps) {
  return (
    <Button
      {...props}
      onClick={onClick}
      text={text}
      icon={icon ?? <ChevronRight size={"var(--size-m)"} />}
      className={twMerge(DetailsButtonClasses.required, DetailsButtonClasses.style, className)}
    />
  );
}
