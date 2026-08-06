import type { ReactNode } from 'react';
import WeekSelector from '../../widgets/mainWidgets/WeekSelector';
import Schedule from '../../widgets/mainWidgets/Schedule';

const SCHEDULE_VIEW_CLASS = 'flex h-full w-full flex-col gap-(--size-m)';

interface ScheduleViewProps {
  selectedMembers: string[];
  viewDate: Date;
  selectedDate: Date;
  onViewDateChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
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
    <div className={SCHEDULE_VIEW_CLASS}>
      <WeekSelector
        viewDate={viewDate}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onViewDateChange={onViewDateChange}
      />
      <Schedule selectedDate={selectedDate} members={selectedMembers} />
      {children}
    </div>
  );
}
