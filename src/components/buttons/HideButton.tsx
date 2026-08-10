import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

interface HideButtonProps {
  text?: ReactNode;
  activeText?: ReactNode;
  inactiveText?: ReactNode;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  defaultVisible?: boolean;
  visible?: boolean;
  onToggle?: (visible: boolean) => void;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const HIDE_BUTTON_CLASS = 'justify-between w-full h-8 p-3 gap-6 bg-transparent text-neutral-400 hover:text-white';

export default function HideButton({
  text,
  activeText,
  inactiveText,
  icon,
  className,
  defaultVisible = true,
  visible,
  onToggle,
  onClick,
  disabled,
  ...props
}: HideButtonProps) {
  const [isVisible, setIsVisible] = useState(visible ?? defaultVisible);

  useEffect(() => {
    if (visible !== undefined) {
      setIsVisible(visible);
    }
  }, [visible]);

  const resolvedVisible = visible ?? isVisible;

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;

    const nextVisible = !resolvedVisible;

    if (visible === undefined) {
      setIsVisible(nextVisible);
    }

    onToggle?.(nextVisible);
    onClick?.(event);
  };

  const resolvedText = resolvedVisible ? (activeText ?? 'Ocultar') : (inactiveText ?? 'Mostrar');

  return (
    <Button
      {...props}
      variant="ghost"
      onClick={handleToggle}
      text={text ?? resolvedText}
      icon={icon ?? (resolvedVisible ? <EyeOff size={16} /> : <Eye size={16} />)}
      disabled={disabled}
      className={twMerge(HIDE_BUTTON_CLASS, className)}
    />
  );
}
