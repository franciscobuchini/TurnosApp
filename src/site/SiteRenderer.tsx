/*
  src/site/SiteRenderer.tsx
  Punto único de renderizado del sitio público: dado un SiteConfig y los
  datos del negocio, arma la página completa. Lo usan tanto Site.tsx (sitio
  real) como Personalizacion.tsx (preview en vivo) — misma implementación,
  nunca una preview aparte.

  Orden pensado para "entrar → entender qué ofrece el negocio → reservar":
  el turnero (BookingWidget) va inmediato después del hero, antes de
  cualquier contenido secundario — no hace falta explorar el sitio para
  llegar a reservar. La elección de servicio vive en el propio wizard
  (ServiceStep), no hay un listado de servicios aparte.
*/

import type { SiteConfig } from '@/database/types';
import type { SiteData } from '@/database/siteData';
import SiteThemeProvider from './SiteThemeProvider';
import SiteHeader from './sections/SiteHeader';
import SiteHero from './sections/SiteHero';
import SiteHours from './sections/SiteHours';
import SiteLocation from './sections/SiteLocation';
import SiteFooter from './sections/SiteFooter';
import BookingWidget from './booking/BookingWidget';

interface SiteRendererProps {
  config: SiteConfig;
  data: SiteData;
  className?: string;
}

const BOOKING_ANCHOR_ID = 'reservar';

function scrollToBooking() {
  document.getElementById(BOOKING_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function SiteRenderer({ config, data, className }: SiteRendererProps) {
  return (
    <SiteThemeProvider config={config} className={className}>
      <SiteHeader business={data.business} title={config.title} onReserveClick={scrollToBooking} />
      <SiteHero title={config.title} description={config.description} />

      <div id={BOOKING_ANCHOR_ID}>
        <BookingWidget services={data.services} team={data.team} business={data.business} />
      </div>

      <SiteHours schedule={data.business.schedule} />
      <SiteLocation business={data.business} />
      <SiteFooter business={data.business} />
    </SiteThemeProvider>
  );
}
