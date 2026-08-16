/*
  src/site/booking/steps/ServiceStep.tsx
  Paso 1: elegir servicio. Toda la card es el control de selección, un click
  alcanza para avanzar, sin botón "Siguiente" ni "Reservar" de por medio.

  El estilo visual de la card (Personalización > Apariencia > "Estilo de
  las cards de servicios") es uno de 4 layouts — no una variación de color/
  radio, cada uno arma el contenido distinto (con/sin foto, en fila o en
  grilla). Agregar un 5° estilo es: un id nuevo en site/design/
  serviceCardStyles.ts + un componente de card acá + una entrada en los dos
  mapas de abajo.
*/

import { twMerge } from 'tailwind-merge';
import { currencyFormatter } from '@/database/data';
import { SERVICE_COLOR_BY_ID } from '@/components/widgets/serviceWidgets/serviceColors';
import Image from '@/components/ui/image';
import type { service, SiteServiceCardStyleId } from '@/database/types';

interface ServiceStepProps {
  services: service[];
  onSelect: (name: string) => void;
  cardStyle?: SiteServiceCardStyleId;
}

interface ServiceCardProps {
  item: service;
  onSelect: (name: string) => void;
}

const CARD_BASE_CLASS =
  'flex w-full cursor-pointer overflow-hidden rounded-(--site-radius) border border-(--site-border) bg-(--site-surface) text-left backdrop-blur-xl transition-colors hover:bg-(--site-bg)';

function ColorDot({ colorId, className }: { colorId?: string; className?: string }) {
  return <span className={twMerge('shrink-0 rounded-full', SERVICE_COLOR_BY_ID[colorId ?? '']?.className, className)} />;
}

function PhotoTopCard({ item, onSelect }: ServiceCardProps) {
  return (
    <button type="button" onClick={() => onSelect(item.name)} className={twMerge(CARD_BASE_CLASS, 'flex-col')}>
      <Image src={item.photo} name={item.name} className="aspect-video w-full shrink-0 rounded-none object-cover" />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <ColorDot colorId={item.colorId} className="size-2.5" />
          <span className="font-medium">{item.name}</span>
        </div>

        {item.description && <p className="line-clamp-2 text-sm text-(--site-text-muted)">{item.description}</p>}

        <span className="mt-auto text-sm text-(--site-text-muted)">
          {item.duration} · {currencyFormatter.format(item.price)}
        </span>
      </div>
    </button>
  );
}

function CompactRowCard({ item, onSelect }: ServiceCardProps) {
  return (
    <button type="button" onClick={() => onSelect(item.name)} className={twMerge(CARD_BASE_CLASS, 'items-center gap-4 p-3')}>
      <Image src={item.photo} name={item.name} className="size-14 shrink-0 rounded-(--site-radius) object-cover" />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <ColorDot colorId={item.colorId} className="size-2" />
          <span className="truncate font-medium">{item.name}</span>
        </div>
        {item.description && <p className="line-clamp-1 text-sm text-(--site-text-muted)">{item.description}</p>}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5 text-sm text-(--site-text-muted)">
        <span>{item.duration}</span>
        <span className="font-medium text-(--site-text)">{currencyFormatter.format(item.price)}</span>
      </div>
    </button>
  );
}

function MinimalListCard({ item, onSelect }: ServiceCardProps) {
  return (
    <button type="button" onClick={() => onSelect(item.name)} className={twMerge(CARD_BASE_CLASS, 'items-center gap-3 p-4')}>
      <ColorDot colorId={item.colorId} className="h-8 w-1.5" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{item.name}</span>
        {item.description && <p className="line-clamp-1 text-sm text-(--site-text-muted)">{item.description}</p>}
      </div>

      <span className="shrink-0 text-sm text-(--site-text-muted)">{currencyFormatter.format(item.price)}</span>
    </button>
  );
}

function PhotoOverlayCard({ item, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.name)}
      className={twMerge(CARD_BASE_CLASS, 'relative aspect-square items-end')}
    >
      <Image src={item.photo} name={item.name} className="absolute inset-0 h-full w-full rounded-none object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

      <div className="relative flex w-full flex-col gap-1 p-4 text-white">
        <div className="flex items-center gap-2">
          <ColorDot colorId={item.colorId} className="size-2.5" />
          <span className="font-medium">{item.name}</span>
        </div>
        <span className="text-sm text-white/80">
          {item.duration} · {currencyFormatter.format(item.price)}
        </span>
      </div>
    </button>
  );
}

const CONTAINER_CLASS_BY_STYLE: Record<SiteServiceCardStyleId, string> = {
  'photo-top': 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  'compact-row': 'flex flex-col gap-2',
  'minimal-list': 'flex flex-col gap-2',
  'photo-overlay': 'grid grid-cols-2 gap-3',
};

const CARD_BY_STYLE: Record<SiteServiceCardStyleId, typeof PhotoTopCard> = {
  'photo-top': PhotoTopCard,
  'compact-row': CompactRowCard,
  'minimal-list': MinimalListCard,
  'photo-overlay': PhotoOverlayCard,
};

export default function ServiceStep({ services, onSelect, cardStyle = 'photo-top' }: ServiceStepProps) {
  const Card = CARD_BY_STYLE[cardStyle] ?? PhotoTopCard;

  return (
    <div className={CONTAINER_CLASS_BY_STYLE[cardStyle] ?? CONTAINER_CLASS_BY_STYLE['photo-top']}>
      {services.map((item) => (
        <Card key={item.name} item={item} onSelect={onSelect} />
      ))}
    </div>
  );
}
