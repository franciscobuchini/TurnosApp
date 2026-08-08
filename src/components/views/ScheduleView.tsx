import type { ReactNode } from 'react';
import { Plus, Pencil } from 'lucide-react';
import MainContent from '../layout/MainContent';
import Button from '../interface/Button';
import WeekSelector from '../widgets/mainWidgets/WeekSelector';
import Schedule from '../widgets/mainWidgets/Schedule';

const SCHEDULE_VIEW_CLASS = 'flex h-full w-full flex-col gap-(--size-l)';

interface ScheduleViewProps {
  selectedMembers: string[];
  viewDate: Date;
  selectedDate: Date;
  onViewDateChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  selectedClientName?: string;
  children?: ReactNode;
}

export default function ScheduleView({
  selectedMembers,
  viewDate,
  selectedDate,
  onViewDateChange,
  onSelectDate,
  children,
}: ScheduleViewProps) {
  return (
    <MainContent variant="schedule" className={SCHEDULE_VIEW_CLASS}>
      <WeekSelector
        viewDate={viewDate}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onViewDateChange={onViewDateChange}
      />
      <Schedule selectedDate={selectedDate} members={selectedMembers} />
      {children}
      <div className="mt-auto">
        <div>
          <Button
            className="gap-(--size-s) px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-900 text-white"
            icon={<Plus size="var(--size-m)" />}
            text="Agregar turno"
          />
          <Button
            className="gap-(--size-s) px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-50 text-neutral-900"
            icon={<Pencil size="var(--size-m)" />}
            text="Editar web"
          />
        </div>
      </div>
    </MainContent>
  );
}
