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

/* BoxClasses:
   - required: estructura. No varía.
   - style: color. Esto sí se puede modificar. */
const BoxClasses = {
  required: 'w-full p-(--size-s)',
  style: '',
};

export default function Box({ children, className }: BoxProps) {
  return (
    <div className={twMerge(BoxClasses.required, BoxClasses.style, className)}>
      {children}
    </div>
  );
}
