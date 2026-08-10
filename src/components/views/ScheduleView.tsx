import type { ReactNode } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import MainContent from '../layout/MainContent';
import { Button } from '@/components/ui/button';
import WeekSelector from '../widgets/mainWidgets/WeekSelector';
import Schedule from '../widgets/mainWidgets/Schedule';

const SCHEDULE_VIEW_CLASS = 'flex h-full w-full flex-col gap-3 p-3';
const ACTIONS_WRAPPER_CLASS = 'flex justify-end w-full gap-2';
const ADD_SHIFT_BUTTON_CLASS = 'h-12 gap-3 px-8 rounded-2xl bg-card text-base text-white hover:bg-card';
const EDIT_WEB_BUTTON_CLASS = 'h-12 gap-3 px-8 rounded-2xl bg-neutral-50 text-base text-neutral-900 hover:bg-neutral-50 hover:text-neutral-900';
const CANCEL_BUTTON_CLASS = 'h-12 gap-3 px-8 rounded-2xl bg-neutral-50 text-base text-neutral-900 hover:bg-neutral-50 hover:text-neutral-900';

interface ScheduleViewProps {
  selectedMembers: string[];
  viewDate: Date;
  selectedDate: Date;
  onViewDateChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  selectedClientName?: string;
  children?: ReactNode;
  onAddShiftClick?: () => void;
  onCancelAddShift?: () => void;
  addShiftOpen?: boolean;
}

export default function ScheduleView({
  selectedMembers,
  viewDate,
  selectedDate,
  onViewDateChange,
  onSelectDate,
  children,
  onAddShiftClick,
  onCancelAddShift,
  addShiftOpen = false,
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
      {addShiftOpen ? (
        <div className={ACTIONS_WRAPPER_CLASS}>
          <Button
            className={CANCEL_BUTTON_CLASS}
            icon={<X size={16} />}
            text="Cancelar"
            onClick={onCancelAddShift}
          />
        </div>
      ) : (
        <div className={ACTIONS_WRAPPER_CLASS}>
          <Button
            className={EDIT_WEB_BUTTON_CLASS}
            icon={<Pencil size={16} />}
            text="Editá tu web"
          />
          <Button
            className={ADD_SHIFT_BUTTON_CLASS}
            icon={<Plus size={16} />}
            text="Agregar turno"
            onClick={onAddShiftClick}
          />
        </div>
      )}
    </MainContent>
  );
}