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

const TOOLTIP_CLASS = 'pointer-events-none absolute whitespace-nowrap rounded-lg px-(--size-s) py-(--size-xs) text-sm opacity-0 group-hover:opacity-100 z-10 bg-neutral-900 text-white';

const TOOLTIP_POSITION_TOP_CLASS = 'bottom-full left-1/2 mb-0 -translate-x-1/2';
const TOOLTIP_POSITION_BOTTOM_CLASS = 'top-full left-1/2 mt-(--size-2xs) -translate-x-1/2';
const TOOLTIP_POSITION_LEFT_CLASS = 'right-full top-1/2 mr-(--size-2xs) -translate-y-1/2';
const TOOLTIP_POSITION_RIGHT_CLASS = 'left-full top-1/2 ml-(--size-2xs) -translate-y-1/2';
const TOOLTIP_POSITION_CLASS: Record<TooltipPosition, string> = {
  top: TOOLTIP_POSITION_TOP_CLASS,
  bottom: TOOLTIP_POSITION_BOTTOM_CLASS,
  left: TOOLTIP_POSITION_LEFT_CLASS,
  right: TOOLTIP_POSITION_RIGHT_CLASS,
};

export function getTooltipPositionClass(position: TooltipPosition) {
  return TOOLTIP_POSITION_CLASS[position];
}

export default function Tooltip({ children, position, className }: TooltipProps) {
  return (
    <span className={twMerge(TOOLTIP_CLASS, getTooltipPositionClass(position), className)}>
      {children}
    </span>
  );
}
