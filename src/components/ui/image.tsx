/*
  src/components/ui/image.tsx
  Componente para mostrar imágenes o un contenedor de reserva (placeholder).
  Cuando no hay imagen y se provee un `name`, muestra las iniciales
  de la primera y última palabra (estilo WhatsApp). Si la imagen falla al
  cargar (URL rota, blob: vencido de otra sesión, etc.) cae al mismo
  placeholder en vez de mostrar un ícono roto.

  El placeholder usa --avatar-text (no --foreground directo): este mismo
  componente se usa tanto en el admin (paleta fija, --foreground ya seguía
  el tema oscuro/claro del panel) como en el sitio público, donde el fondo
  lo elige el dueño del negocio (puede ser claro u oscuro) — --site-* no
  existe en el admin y --foreground no se adapta al fondo del sitio, así
  que ninguno de los dos solo alcanza. --avatar-text se redefine en cada
  contexto (Theme.css para el admin, cssVars.ts para el sitio) para que el
  placeholder siempre contraste con lo que tiene detrás.
*/

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import getInitials from '@/utils/getInitials';

interface ImageProps {
  src?: string;
  alt?: string;
  name?: string;
  className?: string;
}

const IMAGE_CLASS = 'flex items-center justify-center select-none overflow-hidden rounded-full bg-(--avatar-text)/30 text-(--avatar-text) text-xs font-bold object-cover';

const IMAGE_INITIALS_CLASS = '';

export default function Image({ src, alt, name, className }: ImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const mergedClassName = twMerge(IMAGE_CLASS, className);

  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt={alt || name || ''}
        className={mergedClassName}
        onError={() => setFailedSrc(src)}
      />
    );
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
