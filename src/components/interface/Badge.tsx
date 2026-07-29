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
  shapeClassName?: string;
  animationClassName?: string;
  className?: string;
}

/* BadgeStyle: clases de estilo, estas si se pueden variar */
const BadgeStyle = {
  base: 'inline-flex items-center justify-center',
  size: 'px-(--size-xs) py-(--size-3xs) text-sm',
  color: 'bg-neutral-200',
  shape: 'rounded-full',
  animation: '',
};

export default function Badge({ children, colorClassName, sizeClassName, shapeClassName, animationClassName, className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        BadgeStyle.base,
        sizeClassName || BadgeStyle.size,
        colorClassName || BadgeStyle.color,
        shapeClassName || BadgeStyle.shape,
        animationClassName || BadgeStyle.animation,
        className,
      )}
    >
      {children}
    </span>
  );
}
