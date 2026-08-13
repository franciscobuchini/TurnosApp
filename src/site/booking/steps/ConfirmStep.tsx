/*
  src/site/booking/steps/ConfirmStep.tsx
  Paso 5: resumen antes de confirmar — última chance de corregir algo antes
  de escribir el turno en la base.
*/

import { getDayName, getMonthName } from '@/utils/dateName';
import SiteButton from '../../components/SiteButton';
import type { AvailableSlot } from '@/functions/bookingAvailability';
import type { ClientDetails } from '../useBookingFlow';
import type { service } from '@/database/types';

interface ConfirmStepProps {
  service: service;
  date: Date;
  slot: AvailableSlot;
  member: string;
  client: ClientDetails;
  submitting: boolean;
  onConfirm: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-(--site-text-muted)">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function ConfirmStep({ service, date, slot, member, client, submitting, onConfirm }: ConfirmStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-(--site-radius) border border-(--site-border) p-4 text-sm">
        <SummaryRow label="Servicio" value={service.name} />
        <SummaryRow label="Fecha" value={`${getDayName(date)} ${date.getDate()} de ${getMonthName(date)}`} />
        <SummaryRow label="Horario" value={`${slot.startTime} hs`} />
        <SummaryRow label="Profesional" value={member} />
        <SummaryRow label="A nombre de" value={client.name} />
      </div>

      <SiteButton onClick={onConfirm} disabled={submitting}>
        {submitting ? 'Confirmando…' : 'Confirmar turno'}
      </SiteButton>
    </div>
  );
}
