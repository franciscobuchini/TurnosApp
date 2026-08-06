/*
  src/components/interface/Box.tsx
  Contenedor simple para agrupar contenido con borde y padding.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface BoxProps {
  children: ReactNode;
  className?: string;
}

const BOX_CLASS = 'w-full p-(--size-s)';

export default function Box({ children, className }: BoxProps) {
  return (
    <div className={twMerge(BOX_CLASS, className)}>
      {children}
    </div>
  );
}
