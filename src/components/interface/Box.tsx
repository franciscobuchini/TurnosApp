/*
  src/components/interface/Box.tsx
  Contenedor simple para agrupar contenido con borde y padding.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface BoxProps {
  children: ReactNode;
  className?: string;
  sizeClassName?: string;
  colorClassName?: string;
  shapeClassName?: string;
  animationClassName?: string;
}

/* BoxStyle: clases de estilo, estas si se pueden variar */
const BoxStyle = {
  base: 'w-full',
  size: '',
  color: '',
  shape: '',
  animation: '',
};

export default function Box({ children, className, sizeClassName, colorClassName, shapeClassName, animationClassName }: BoxProps) {
  return (
    <div className={twMerge(BoxStyle.base, sizeClassName || BoxStyle.size, colorClassName || BoxStyle.color, shapeClassName || BoxStyle.shape, animationClassName || BoxStyle.animation, className)}>
      {children}
    </div>
  );
}
