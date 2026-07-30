/* 
  src/components/interface/Icon.tsx
  Componente genérico de icono para renderizar dinámicamente iconos de lucide-react.
*/

import { icons } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface IconProps {
  name: keyof typeof icons;
  className?: string;
  styleClassName?: string;
}

/* IconClasses */

const IconClasses = {
  required: 'w-(--size-m) h-(--size-m)',
  style: '',
};

export default function Icon({ name, className, styleClassName }: IconProps) {
  const LucideIcon = icons[name];

  return (
    <LucideIcon
      className={twMerge(IconClasses.required, styleClassName || IconClasses.style, className)}
    />
  );
}