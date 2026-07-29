/* 
  src/components/interface/Icon.tsx
  Componente genérico de icono para renderizar dinámicamente iconos de lucide-react.
*/

import { icons } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface IconProps {
  name: keyof typeof icons;
  className?: string;
  sizeClassName?: string;
  colorClassName?: string;
  shapeClassName?: string;
  animationClassName?: string;
}

/* IconStyle: clases de estilo, estas si se pueden variar */
const IconStyle = {
  base: '',
  size: 'w-(--size-m) h-(--size-m)',
  color: '',
  shape: '',
  animation: '',
};

export default function Icon({ name, className, sizeClassName, colorClassName, shapeClassName, animationClassName }: IconProps) {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react.`);
    return null;
  }

  return (
    <LucideIcon
      className={twMerge(IconStyle.base, sizeClassName || IconStyle.size, colorClassName || IconStyle.color, shapeClassName || IconStyle.shape, animationClassName || IconStyle.animation, className)}
    />
  );
}
