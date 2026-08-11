/* 
  src/components/ui/image.tsx
  Componente para mostrar imágenes o un contenedor de reserva (placeholder).
  Cuando no hay imagen y se provee un `name`, muestra las iniciales
  de la primera y última palabra (estilo WhatsApp).
*/

import { twMerge } from 'tailwind-merge';
import getInitials from '@/utils/getInitials';

interface ImageProps {
  src?: string;
  alt?: string;
  name?: string;
  className?: string;
}

const IMAGE_CLASS = 'flex items-center justify-center select-none overflow-hidden rounded-full bg-gray text-black text-xs font-bold object-cover';

const IMAGE_INITIALS_CLASS = '';

export default function Image({ src, alt, name, className }: ImageProps) {
  const mergedClassName = twMerge(IMAGE_CLASS, className);

  if (src) {
    return <img src={src} alt={alt || name || ''} className={mergedClassName} />;
  }

  const initials = name ? getInitials(name) : '';

  return (
    <div className={mergedClassName}>
      {initials ? (
        <span className={IMAGE_INITIALS_CLASS}>
          {initials}
        </span>
      ) : null}
    </div>
  );
}