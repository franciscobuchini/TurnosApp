/* 
  src/components/interface/Image.tsx
  Componente para mostrar imágenes o un contenedor de reserva (placeholder).
*/

import { twMerge } from 'tailwind-merge';

interface ImageProps {
  src?: string;
  alt?: string;
  sizeClassName?: string;
  colorClassName?: string;
  shapeClassName?: string;
  animationClassName?: string;
  className?: string;
}

/* ImageStyle: clases de estilo, estas si se pueden variar */
const ImageStyle = {
  base: 'flex items-center justify-center select-none',
  size: 'w-(--size-4xl) h-(--size-4xl)',
  color: 'bg-neutral-200',
  shape: '',
  animation: '',
};

export default function Image({ src, alt, sizeClassName, colorClassName, shapeClassName, animationClassName, className }: ImageProps) {
  const mergedClassName = twMerge(
    sizeClassName || ImageStyle.size,
    colorClassName || ImageStyle.color,
    shapeClassName || ImageStyle.shape,
    animationClassName || ImageStyle.animation,
    className,
  );

  if (src) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className={twMerge(ImageStyle.base, mergedClassName)}
      />
    );
  }

  return (
    <div className={mergedClassName}>
      {/* Cuadrado para imágenes (vacío por el momento) */}
    </div>
  );
}
