/*
  src/site/booking/steps/ClientDetailsStep.tsx
  Paso 4 (último antes de confirmar): datos de contacto — el mínimo
  indispensable para confirmar (nombre y teléfono). Email y notas quedan
  opcionales. Sin botón propio: el de "Confirmar" vive al final de todo
  (BookingWidget), debajo de BookingSummary, ya que ahí se ve el resto de
  la reserva junto con estos mismos datos (se reflejan en vivo).
*/

import SiteField, { SITE_INPUT_CLASS } from '../../components/SiteField';
import { twMerge } from 'tailwind-merge';
import type { ClientDetails } from '../useBookingFlow';

interface ClientDetailsStepProps {
  client: ClientDetails;
  onChange: (patch: Partial<ClientDetails>) => void;
}

export default function ClientDetailsStep({ client, onChange }: ClientDetailsStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <SiteField label="Nombre">
        <input
          value={client.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Tu nombre"
          className={SITE_INPUT_CLASS}
        />
      </SiteField>

      <SiteField label="Teléfono">
        <input
          value={client.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
          placeholder="+54 9 11 2345-6789"
          className={SITE_INPUT_CLASS}
        />
      </SiteField>

      <SiteField label="Email (opcional)">
        <input
          type="email"
          value={client.email}
          onChange={(event) => onChange({ email: event.target.value })}
          placeholder="tu@mail.com"
          className={SITE_INPUT_CLASS}
        />
      </SiteField>

      <SiteField label="Notas (opcional)">
        <textarea
          value={client.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Algo que debamos saber"
          rows={3}
          className={twMerge(SITE_INPUT_CLASS, 'resize-none')}
        />
      </SiteField>
    </div>
  );
}
