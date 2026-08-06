/* 
  src/components/interface/Badge.tsx
  Componente de etiqueta (badge) para mostrar estados, categorías o etiquetas.
*/

import type { HTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  className?: string;
}

/* BadgeClasses:
   - required: estructura, tamaño y forma. No varía.
   - style: color. Esto sí se puede modificar. */
const BadgeClasses = {
  required: 'inline-flex items-center justify-center px-(--size-s) py-(--size-xs) text-sm rounded-full',
  style: 'bg-neutral-200',
};

export default function Badge({ children, className, ...props }: BadgeProps) {
  return (
    <span {...props} className={twMerge(BadgeClasses.required, BadgeClasses.style, className)}>
      {children}
    </span>
  );
}
