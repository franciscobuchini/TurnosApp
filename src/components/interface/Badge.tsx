/* 
  src/components/interface/Badge.tsx
  Componente de etiqueta (badge) para mostrar estados, categorías o etiquetas.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: ReactNode;
  styleClassName?: string;
  className?: string;
}

/* BadgeClasses:
   - required: estructura, tamaño y forma. No varía.
   - style: color. Esto sí se puede modificar. */
const BadgeClasses = {
  required: 'inline-flex items-center justify-center px-(--size-xs) py-(--size-3xs) text-sm rounded-full',
  style: 'bg-neutral-200',
};

export default function Badge({ children, styleClassName, className }: BadgeProps) {
  return (
    <span className={twMerge(BadgeClasses.required, styleClassName || BadgeClasses.style, className)}>
      {children}
    </span>
  );
}