/* 
  src/components/interface/Image.tsx
  Componente para mostrar imágenes o un contenedor de reserva (placeholder).
*/

import { twMerge } from 'tailwind-merge';

interface ImageProps {
  src?: string;
  alt?: string;
  sizeClassName?: string;
  borderClassName?: string;
  className?: string;
}

/* ImageStyle: clases de estilo, estas si se pueden variar */
const ImageStyle = {
  image: 'bg-neutral-200',
  size: 'w-(--size-4xl) h-(--size-4xl)',
  border: '',
};

export default function Image({ src, alt, sizeClassName, borderClassName, className }: ImageProps) {
  const mergedClassName = twMerge(
    ImageStyle.image,
    sizeClassName || ImageStyle.size,
    borderClassName || ImageStyle.border,
    className,
  );

  if (src) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className={twMerge('flex items-center justify-center select-none', mergedClassName)}
      />
    );
  }

  return (
    <div className={mergedClassName}>
      {/* Cuadrado para imágenes (vacío por el momento) */}
    </div>
  );
}
