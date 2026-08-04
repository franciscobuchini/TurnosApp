import { useState } from 'react';
import type { ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface HideButtonProps {
  text?: ReactNode;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  defaultVisible?: boolean;
  onToggle?: (visible: boolean) => void;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const HideButtonClasses = {
  required: 'justify-between w-full h-(--size-xl) p-(--size-s) gap-(--size-l)',
  style: 'bg-transparent text-stone-400 hover:text-white',
};

export default function HideButton({
  text,
  icon,
  className,
  defaultVisible = true,
  onToggle,
  onClick,
  disabled,
  ...props
}: HideButtonProps) {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;

    const nextVisible = !isVisible;
    setIsVisible(nextVisible);
    onToggle?.(nextVisible);
    onClick?.(event);
  };

  const resolvedText = isVisible ? 'Ocultar' : 'Mostrar';

  return (
    <Button
      {...props}
      onClick={handleToggle}
      text={text ?? resolvedText}
      icon={icon ?? (isVisible ? <EyeOff size={"var(--size-m)"} /> : <Eye size={"var(--size-m)"} />)}
      disabled={disabled}
      className={twMerge(HideButtonClasses.required, HideButtonClasses.style, className)}
    />
  );
}
