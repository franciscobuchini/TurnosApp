/*
  src/components/interface/Tooltip.tsx
  Tooltip reutilizable para mostrar ayuda contextual en hover.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: ReactNode;
  position: TooltipPosition;
  className?: string;
}

const TooltipClasses = {
  required:
    'pointer-events-none absolute whitespace-nowrap rounded-lg px-(--size-s) py-(--size-xs) text-sm opacity-0 group-hover:opacity-100 z-10',
  style: 'bg-neutral-900 text-white',
};

const TooltipPositionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 mb-0 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-(--size-2xs) -translate-x-1/2',
  left: 'right-full top-1/2 mr-(--size-2xs) -translate-y-1/2',
  right: 'left-full top-1/2 ml-(--size-2xs) -translate-y-1/2',
};

export function getTooltipPositionClass(position: TooltipPosition) {
  return TooltipPositionClasses[position];
}

export default function Tooltip({ children, position, className }: TooltipProps) {
  return (
    <span className={twMerge(TooltipClasses.required, getTooltipPositionClass(position), TooltipClasses.style, className)}>
      {children}
    </span>
  );
}
