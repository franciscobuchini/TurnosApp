/* 
  src/components/interface/Image.tsx
  Componente para mostrar imágenes o un contenedor de reserva (placeholder).
*/

import { twMerge } from 'tailwind-merge';

interface ImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

/* ImageStyle: clases de estilo, estas si se pueden variar */
const ImageStyle = {
  image: 'w-(--size-4xl) h-(--size-4xl) bg-neutral-200',
};

export default function Image({ src, alt, className }: ImageProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className={twMerge('flex items-center justify-center select-none',ImageStyle.image, className)}
      />
    );
  }

  return (
    <div className={twMerge(ImageStyle.image, className)}>
      {/* Cuadrado para imágenes (vacío por el momento) */}
    </div>
  );
}
