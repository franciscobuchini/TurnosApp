/* 
  src/components/interface/Image.tsx
  Componente para mostrar imágenes o un contenedor de reserva (placeholder).
  Cuando no hay imagen y se provee un `name`, muestra las iniciales
  de la primera y última palabra (estilo WhatsApp).
*/

import { twMerge } from 'tailwind-merge';
import getInitials from '../../functions/getInitials';

interface ImageProps {
  src?: string;
  alt?: string;
  name?: string;
  className?: string;
}

const IMAGE_CLASS = 'flex items-center justify-center select-none leading-none bg-neutral-600 rounded-full text-white text-xs font-bold';

const IMAGE_INITIALS_CLASS = '';

export default function Image({ src, alt, name, className }: ImageProps) {
  const mergedClassName = twMerge(IMAGE_CLASS, className);

  if (src) {
    return <img src={src} alt={alt || name || ''} className={mergedClassName} />;
  }

  return (
    <div className={mergedClassName}>
      {name && (
        <span className={IMAGE_INITIALS_CLASS}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}