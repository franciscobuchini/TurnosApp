/*
  src/site/booking/steps/ScheduleStep.tsx
  Paso combinado fecha + horario: el selector de día (DateStep) queda fijo
  arriba y los horarios disponibles (TimeSlotStep) se actualizan debajo a
  medida que se navega entre días — nunca se pierde el selector de vista.
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
    <div className="flex flex-col gap-5">
      <DateStep schedule={schedule} selectedDate={selectedDate} onSelect={onSelectDate} />
      <TimeSlotStep slots={slots} onSelect={onSelectSlot} />
    </div>
  );
}
