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

/* ImageClasses:
   - required: estructura y tamaño. No varía.
   - style: color. Esto sí se puede modificar. */
const ImageClasses = {
  required: 'flex items-center justify-center select-none w-(--size-5xl) h-(--size-5xl) rounded-full',
  style: 'bg-stone-700',
};

/* ImageInitialsClasses: estilo del texto de iniciales */
const ImageInitialsClasses = {
  required: 'text-sm font-medium leading-none',
  style: '',
};

export default function Image({ src, alt, name, className }: ImageProps) {
  const mergedClassName = twMerge(ImageClasses.required, ImageClasses.style, className);

  if (src) {
    return <img src={src} alt={alt || name || ''} className={mergedClassName} />;
  }

  return (
    <div className={mergedClassName}>
      {name && (
        <span className={twMerge(ImageInitialsClasses.required, ImageInitialsClasses.style)}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
