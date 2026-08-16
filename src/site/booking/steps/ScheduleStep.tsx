/*
  src/site/booking/steps/ScheduleStep.tsx
  Paso combinado fecha + horario: el selector de día (DateStep) queda fijo
  arriba y los horarios disponibles (TimeSlotStep) se actualizan debajo a
  medida que se navega entre días — nunca se pierde el selector de vista.
  Ambos son listas verticales simples ahora, por eso llevan una etiqueta
  chica arriba para distinguir dónde empieza cada una.
*/

import DateStep from './DateStep';
import TimeSlotStep from './TimeSlotStep';
import type { AvailableSlot } from '@/functions/bookingAvailability';
import type { OpeningHoursEntry } from '@/database/types';

interface ScheduleStepProps {
  schedule: OpeningHoursEntry[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  slots: AvailableSlot[];
  onSelectSlot: (slot: AvailableSlot) => void;
}

export default function ScheduleStep({ schedule, selectedDate, onSelectDate, slots, onSelectSlot }: ScheduleStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="px-1 text-sm text-(--site-text-muted)">Día</span>
        <DateStep schedule={schedule} selectedDate={selectedDate} onSelect={onSelectDate} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="px-1 text-sm text-(--site-text-muted)">Horario</span>
        <TimeSlotStep slots={slots} onSelect={onSelectSlot} />
      </div>
    </div>
  );
}
