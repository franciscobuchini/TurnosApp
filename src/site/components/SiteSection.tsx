/*
  src/site/components/SiteSection.tsx
  Contenedor de ancho/padding consistente para cada bloque del sitio (hero,
  servicios, equipo, etc.) — evita repetir la misma clase de layout en cada
  sección.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface SiteSectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

const INNER_CLASS = 'mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16';

export default function SiteSection({ id, className, children }: SiteSectionProps) {
  return (
    <section id={id} className="w-full">
      <div className={twMerge(INNER_CLASS, className)}>{children}</div>
    </section>
  );
}
