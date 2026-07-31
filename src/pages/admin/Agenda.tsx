/* 
  src/pages/admin/Agenda.tsx
  Calendario de turnos para el usuario admin.
*/

import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import SidebarHeader from '../../components/widgets/SidebarHeader';
import MainContent from '../../components/layout/MainContent';
import Button from '../../components/interface/Button';
import Calendar from '../../components/widgets/Calendar';
import Schedule from '../../components/widgets/Schedule';
import WeekSelector from '../../components/widgets/WeekSelector';

/* getWeekDays: dado un día, devuelve 7 fechas centradas en él (3 antes, el día, 3 después) */
const getWeekDays = (date: Date): Date[] => {
  const week: Date[] = [];
  for (let offset = -3; offset <= 3; offset++) {
    const next = new Date(date);
    next.setDate(date.getDate() + offset);
    week.push(next);
  }
  return week;
};

function Agenda() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekDays = getWeekDays(viewDate);

  const prevWeek = () => {
    const next = new Date(viewDate);
    next.setDate(viewDate.getDate() - 7);
    setViewDate(next);
  };

  const nextWeek = () => {
    const next = new Date(viewDate);
    next.setDate(viewDate.getDate() + 7);
    setViewDate(next);
  };

  return (
    <Layout>
      <Sidebar>
        <SidebarHeader
          title="Agenda"
          action={<Button textAlign="center" icon={<CalendarPlus size={20} />} />}
        />
        <Calendar />
        {/* <Filters /> */}
      </Sidebar>
      <MainContent>
        <WeekSelector
          weekDays={weekDays}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPrevWeek={prevWeek}
          onNextWeek={nextWeek}
        />
        <Schedule selectedDate={selectedDate} />
      </MainContent>
    </Layout>
  );
}
export default Agenda;