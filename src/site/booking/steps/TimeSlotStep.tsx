/*
  src/site/booking/steps/TimeSlotStep.tsx
  Paso 3: elegir horario, entre los slots ya calculados por
  bookingAvailability.ts (horario del negocio ∩ del profesional, menos
  turnos ya reservados).
*/

import type { AvailableSlot } from '@/functions/bookingAvailability';

interface TimeSlotStepProps {
  slots: AvailableSlot[];
  onSelect: (slot: AvailableSlot) => void;
}

export default function TimeSlotStep({ slots, onSelect }: TimeSlotStepProps) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-(--site-text-muted)">
        No hay horarios disponibles ese día. Probá con otra fecha.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => (
        <button
          key={slot.startTime}
          type="button"
          onClick={() => onSelect(slot)}
          className="cursor-pointer rounded-(--site-radius) border border-(--site-border) py-2 text-sm transition-colors hover:bg-(--site-bg)"
        >
          {slot.startTime}
        </button>
      ))}
    </div>
  );
}
