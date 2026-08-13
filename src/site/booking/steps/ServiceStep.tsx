/*
  src/site/booking/steps/ServiceStep.tsx
  Paso 1: elegir servicio. Grilla de 2 columnas con foto, nombre, descripción,
  duración y precio — toda la card es el control de selección, un click
  alcanza para avanzar, sin botón "Siguiente" ni "Reservar" de por medio.
*/

import { twMerge } from 'tailwind-merge';
import { currencyFormatter } from '@/database/data';
import { SERVICE_COLOR_BY_ID } from '@/components/widgets/serviceWidgets/serviceColors';
import Image from '@/components/ui/image';
import type { service } from '@/database/types';

interface ServiceStepProps {
  services: service[];
  onSelect: (name: string) => void;
}

export default function ServiceStep({ services, onSelect }: ServiceStepProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {services.map((item) => (
        <button
          key={item.name}
          type="button"
          onClick={() => onSelect(item.name)}
          className="flex cursor-pointer flex-col overflow-hidden rounded-(--site-radius) border border-(--site-border) text-left transition-colors hover:bg-(--site-bg)"
        >
          <Image src={item.photo} name={item.name} className="aspect-video w-full shrink-0 rounded-none object-cover" />

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <span
                className={twMerge('size-2.5 shrink-0 rounded-full', SERVICE_COLOR_BY_ID[item.colorId ?? '']?.className)}
              />
              <span className="font-medium">{item.name}</span>
            </div>

            {item.description && (
              <p className="line-clamp-2 text-sm text-(--site-text-muted)">{item.description}</p>
            )}

            <span className="mt-auto text-sm text-(--site-text-muted)">
              {item.duration} · {currencyFormatter.format(item.price)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
