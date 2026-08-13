/*
  src/site/sections/SiteLocation.tsx
  Ubicación — apartado propio, separado de Horarios (ver SiteHours.tsx).
  WhatsApp/Instagram viven acá como canales de contacto secundarios: links
  con estilo "outline" que nunca compiten con el botón "Reservar turno"
  (siempre primary).

  El mapa todavía no existe (falta integrar una API de mapas) — el box con
  id="mapa-ubicacion" queda como placeholder listo para reemplazar por el
  mapa real más adelante, sin tener que rearmar el layout de la sección.
*/

import { AtSign, MapPin, MessageCircle } from 'lucide-react';
import SiteSection from '../components/SiteSection';
import { SiteLinkButton } from '../components/SiteButton';
import { SITE_HEADING_CLASS } from '../design/cssVars';
import type { SiteBusinessData } from '@/database/siteData';

interface SiteLocationProps {
  business: SiteBusinessData;
}

function whatsappHref(whatsapp: string): string {
  return `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
}

function instagramHref(instagram: string): string {
  return `https://instagram.com/${instagram.replace(/^@/, '')}`;
}

export default function SiteLocation({ business }: SiteLocationProps) {
  const hasContactChannels = Boolean(business.whatsapp || business.instagram);

  return (
    <SiteSection id="ubicacion" className="max-w-2xl">
      <h2 className={`text-2xl font-semibold ${SITE_HEADING_CLASS}`}>Ubicación</h2>

      {business.location && (
        <div className="flex items-center gap-2 text-(--site-text-muted)">
          <MapPin className="size-4 shrink-0" />
          <span>{business.location}</span>
        </div>
      )}

      <div
        id="mapa-ubicacion"
        className="flex aspect-video w-full items-center justify-center rounded-(--site-radius) border border-dashed border-(--site-border) text-(--site-text-muted)"
      >
        <span className="flex items-center gap-2 text-sm">
          <MapPin className="size-4" />
          Mapa próximamente
        </span>
      </div>

      {hasContactChannels && (
        <div className="flex flex-wrap gap-3">
          {business.whatsapp && (
            <SiteLinkButton
              variant="outline"
              size="sm"
              icon={<MessageCircle className="size-4" />}
              href={whatsappHref(business.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </SiteLinkButton>
          )}
          {business.instagram && (
            <SiteLinkButton
              variant="outline"
              size="sm"
              icon={<AtSign className="size-4" />}
              href={instagramHref(business.instagram)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </SiteLinkButton>
          )}
        </div>
      )}
    </SiteSection>
  );
}
