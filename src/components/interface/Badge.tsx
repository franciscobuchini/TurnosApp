/* 
  src/components/interface/Badge.tsx
  Componente de etiqueta (badge) para mostrar estados, categorías o etiquetas.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: ReactNode;
  colorClassName?: string;
  sizeClassName?: string;
  className?: string;
}

/* BadgeStyle: clases de estilo, estas si se pueden variar */
const BadgeStyle = {
  badge: 'rounded-full',
  color: 'bg-neutral-200',
  size: 'px-(--size-xs) py-(--size-3xs) text-sm',
};

export default function Badge({ children, colorClassName, sizeClassName, className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center justify-center',
        BadgeStyle.badge,
        colorClassName || BadgeStyle.color,
        sizeClassName || BadgeStyle.size,
        className,
      )}
    >
      {children}
    </span>
  );
}
