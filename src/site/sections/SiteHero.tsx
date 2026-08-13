/*
  src/site/sections/SiteHero.tsx
  Título y descripción editables desde Personalización — lo único de
  contenido que el dueño del negocio escribe a mano en todo el sitio. El CTA
  de reservar vive en el header (persistente) y en el propio turnero, que
  arranca inmediato después de esta sección — acá alcanza con el mensaje.
*/

import SiteSection from '../components/SiteSection';
import { SITE_HEADING_CLASS } from '../design/cssVars';

interface SiteHeroProps {
  title: string;
  description: string;
}

export default function SiteHero({ title, description }: SiteHeroProps) {
  return (
    <SiteSection className="items-center pt-16 pb-10 text-center">
      <h1 className={`text-4xl font-semibold tracking-tight text-balance sm:text-5xl ${SITE_HEADING_CLASS}`}>
        {title}
      </h1>
      <p className="max-w-xl text-lg text-(--site-text-muted)">
        {description || 'Reservá tu turno online en simples pasos.'}
      </p>
    </SiteSection>
  );
}
