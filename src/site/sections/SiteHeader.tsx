/*
  src/site/sections/SiteHeader.tsx
  Barra superior fija: logo + nombre a la izquierda, CTA de reserva siempre
  visible a la derecha — el turnero nunca queda a más de un scroll/click.
*/

import Image from '@/components/ui/image';
import SiteButton from '../components/SiteButton';
import { SITE_HEADING_CLASS } from '../design/cssVars';
import type { SiteBusinessData } from '@/database/siteData';

interface SiteHeaderProps {
  business: SiteBusinessData;
  onReserveClick: () => void;
}

const HEADER_CLASS = 'sticky top-0 z-20 w-full border-b border-(--site-border) bg-(--site-surface) backdrop-blur-xl';

const HEADER_INNER_CLASS = 'mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3';

export default function SiteHeader({ business, onReserveClick }: SiteHeaderProps) {
  return (
    <header className={HEADER_CLASS}>
      <div className={HEADER_INNER_CLASS}>
        <div className="flex min-w-0 items-center gap-3">
          <Image src={business.logo} name={business.name} className="size-10 shrink-0" />
          <span className={`truncate text-xl font-bold ${SITE_HEADING_CLASS}`}>
            {business.name}
          </span>
        </div>
        <SiteButton size="sm" onClick={onReserveClick}>
          Reservar turno
        </SiteButton>
      </div>
    </header>
  );
}
