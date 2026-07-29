/* 
  src/components/interface/Icon.tsx
  Componente genérico de icono para renderizar dinámicamente iconos de lucide-react.
*/

import { icons } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface IconProps {
  name: keyof typeof icons;
  className?: string;
}

/* IconStyle: clases de estilo, estas si se pueden variar */
const IconStyle = {
  icon: 'w-(--size-m) h-(--size-m)',
};

export default function Icon({ name, className }: IconProps) {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react.`);
    return null;
  }

  return (
    <LucideIcon
      className={twMerge(IconStyle.icon, className)}
    />
  );
}
