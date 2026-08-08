import type { ReactNode } from 'react';
import { Plus, Pencil } from 'lucide-react';
import MainContent from '../layout/MainContent';
import Button from '../interface/Button';
import WeekSelector from '../widgets/mainWidgets/WeekSelector';
import Schedule from '../widgets/mainWidgets/Schedule';

const SCHEDULE_VIEW_CLASS = 'flex h-full w-full flex-col gap-(--size-m) p-(--size-m)';
const ACTIONS_WRAPPER_CLASS = 'flex justify-end w-full gap-(--size-l)';
const ADD_SHIFT_BUTTON_CLASS =
  'gap-(--size-s) px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-900 text-white';
const EDIT_WEB_BUTTON_CLASS =
  'gap-(--size-s) px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-50 text-neutral-900';

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
      <div className={ACTIONS_WRAPPER_CLASS}>
        <Button
          className={EDIT_WEB_BUTTON_CLASS}
          icon={<Pencil size="var(--size-m)" />}
          text="Editar web"
        />
        <Button
          className={ADD_SHIFT_BUTTON_CLASS}
          icon={<Plus size="var(--size-m)" />}
          text="Agregar turno"
        />
      </div>
    </MainContent>
  );
}