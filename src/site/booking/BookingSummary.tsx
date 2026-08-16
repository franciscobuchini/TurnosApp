/*
  src/site/booking/BookingSummary.tsx
  Resumen de la reserva en progreso, debajo del contenido de cada paso
  (BookingWidget) desde que se elige el servicio — mismo recuadro durante
  fecha/horario, profesional y datos, que se va completando con lo que ya
  está elegido (el resto queda en "—") en vez de aparecer recién al final,
  así el cliente ve en todo momento qué está reservando sin tener que
  volver atrás a revisar.

  Nombre/teléfono/email/notas se suman a partir de ClientDetailsStep (paso
  "details"): al tipear ahí, el mismo recuadro ya los refleja. Es el único
  resumen del flujo — no hay un paso "confirmar" aparte, el botón final
  vive debajo de este mismo recuadro (ver BookingWidget).
*/

import { getDayName, getMonthName } from '@/utils/dateName';
import type { AvailableSlot } from '@/functions/bookingAvailability';
import type { service } from '@/database/types';
import type { ClientDetails } from './useBookingFlow';

interface BookingSummaryProps {
  service: service | null;
  date: Date | null;
  slot: AvailableSlot | null;
  member: string | null;
  client: ClientDetails;
}

function SummaryRow({ label, value, filled }: { label: string; value: string; filled: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-(--site-text-muted)">{label}</span>
      <span className={filled ? 'font-medium text-(--site-text)' : 'text-(--site-text-muted)'}>{value}</span>
    </div>
  );
}

export default function BookingSummary({ service, date, slot, member, client }: BookingSummaryProps) {
  return (
    <div className="mt-6 flex flex-col gap-2 rounded-(--site-radius) bg-(--site-bg) p-4 text-sm">
      <SummaryRow label="Servicio" value={service?.name ?? '—'} filled={Boolean(service)} />
      <SummaryRow
        label="Fecha"
        value={date ? `${getDayName(date)} ${date.getDate()} de ${getMonthName(date)}` : '—'}
        filled={Boolean(date)}
      />
      <SummaryRow label="Horario" value={slot ? `${slot.startTime} hs` : '—'} filled={Boolean(slot)} />
      <SummaryRow label="Profesional" value={member ?? '—'} filled={Boolean(member)} />
      <SummaryRow label="Nombre" value={client.name.trim() || '—'} filled={Boolean(client.name.trim())} />
      <SummaryRow label="Teléfono" value={client.phone.trim() || '—'} filled={Boolean(client.phone.trim())} />
      <SummaryRow label="Email" value={client.email.trim() || '—'} filled={Boolean(client.email.trim())} />
      <SummaryRow label="Notas" value={client.notes.trim() || '—'} filled={Boolean(client.notes.trim())} />
    </div>
  );
}
