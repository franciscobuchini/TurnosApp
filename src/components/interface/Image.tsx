/* 
  src/components/interface/Image.tsx
  Componente para mostrar imágenes o un contenedor de reserva (placeholder).
*/

import { twMerge } from 'tailwind-merge';

interface ImageProps {
  src?: string;
  alt?: string;
  styleClassName?: string;
  className?: string;
}

/* ImageClasses:
   - required: estructura y tamaño. No varía.
   - style: color. Esto sí se puede modificar. */
const ImageClasses = {
  required: 'flex items-center justify-center select-none w-(--size-5xl) h-(--size-5xl)',
  style: 'bg-neutral-200',
};

export default function Image({ src, alt, styleClassName, className }: ImageProps) {
  const mergedClassName = twMerge(ImageClasses.required, styleClassName || ImageClasses.style, className);

  if (src) {
    return <img src={src} alt={alt || ''} className={mergedClassName} />;
  }

  return (
    <div className={mergedClassName}>
      {/* Cuadrado para imágenes (vacío por el momento) */}
    </div>
  );
}