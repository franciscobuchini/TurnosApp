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

const BADGE_CLASS = 'inline-flex items-center justify-center px-(--size-l) py-(--size-xs) rounded-full text-sm  ';

export default function Badge({ children, className, ...props }: BadgeProps) {
  return (
    <span {...props} className={twMerge(BADGE_CLASS, className)}>
      {children}
    </span>
  );
}
