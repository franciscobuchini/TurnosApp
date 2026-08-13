/*
  src/site/booking/steps/ClientDetailsStep.tsx
  Paso 4: datos de contacto — el mínimo indispensable para confirmar
  (nombre y teléfono). Notas queda opcional.
*/

import SiteField, { SITE_INPUT_CLASS } from '../../components/SiteField';
import SiteButton from '../../components/SiteButton';
import { twMerge } from 'tailwind-merge';
import type { ClientDetails } from '../useBookingFlow';

interface ClientDetailsStepProps {
  client: ClientDetails;
  onChange: (patch: Partial<ClientDetails>) => void;
  isValid: boolean;
  onContinue: () => void;
}

export default function ClientDetailsStep({ client, onChange, isValid, onContinue }: ClientDetailsStepProps) {
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

      <SiteField label="Notas (opcional)">
        <textarea
          value={client.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Algo que debamos saber"
          rows={3}
          className={twMerge(SITE_INPUT_CLASS, 'resize-none')}
        />
      </SiteField>

      <SiteButton disabled={!isValid} onClick={onContinue}>
        Continuar
      </SiteButton>
    </div>
  );
}
