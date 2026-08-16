/*
  src/site/sections/SiteHero.tsx
  Título (nombre del negocio) + bajada fija — ninguno de los dos es
  editable desde Personalización: el título duplicaba Business.name (así
  que se usa directo) y la bajada es siempre la misma, no hace falta un
  campo aparte para un texto que no cambia. El CTA de reservar vive en el
  header (persistente) y en el propio turnero, que arranca inmediato
  después de esta sección — acá alcanza con el mensaje.
*/

import SiteSection from '../components/SiteSection';
import { SITE_HEADING_CLASS } from '../design/cssVars';

interface SiteHeroProps {
  businessName: string;
}

export default function SiteHero({ businessName }: SiteHeroProps) {
  return (
    <SiteSection className="items-center pt-16 pb-10 text-center">
      <h1 className={`text-4xl font-semibold tracking-tight text-balance sm:text-5xl ${SITE_HEADING_CLASS}`}>
        {businessName}
      </h1>
      <p className="max-w-xl text-lg text-(--site-text-muted)">
        Reservá tu turno online en simples pasos.
      </p>
    </SiteSection>
  );
}
