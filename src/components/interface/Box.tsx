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

/* BoxStyle: clases de estilo, estas si se pueden variar */
const BoxStyle = {
  box: '',
};

export default function Box({ children, className }: BoxProps) {
  return (
    <div className={twMerge('w-full',BoxStyle.box, className)}>
      {children}
    </div>
  );
}
