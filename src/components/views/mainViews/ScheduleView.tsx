import type { ReactNode } from 'react';
import MainContent from '../../layout/MainContent';
import WeekSelector from '../../widgets/mainWidgets/WeekSelector';
import Schedule from '../../widgets/mainWidgets/Schedule';

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
    <MainContent variant="schedule">
      <WeekSelector
        viewDate={viewDate}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onViewDateChange={onViewDateChange}
      />
      <Schedule selectedDate={selectedDate} members={selectedMembers} />
      {children}
    </MainContent>
  );
}
