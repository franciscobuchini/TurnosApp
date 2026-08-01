/* 
  src/pages/admin/Agenda.tsx
  Calendario de turnos para el usuario admin.
*/

import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import MainHeader from '../../components/widgets/MainHeader';
import MainContent from '../../components/layout/MainContent';
import Button from '../../components/interface/Button';
import Calendar from '../../components/widgets/Calendar';
import Filters, { type FiltersOption } from '../../components/interface/Filters';
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

const initialTeamFilters: FiltersOption[] = [
  { id: 'carlos-rodriguez', label: 'Carlos Rodriguez' },
  { id: 'mariana-lopez', label: 'Mariana Lopez' },
  { id: 'diego-fernandez', label: 'Diego Fernandez' },
];

const initialServiceFilters: FiltersOption[] = [
  { id: 'corte', label: 'Corte' },
  { id: 'barba', label: 'Barba' },
  { id: 'coloracion', label: 'Coloracion' },
  { id: 'reflejos', label: 'Reflejos' },
];

function Agenda() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [teamFilters, setTeamFilters] = useState(initialTeamFilters);
  const [serviceFilters, setServiceFilters] = useState(initialServiceFilters);

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

  const toggleTeamFilter = (id: string, checked: boolean) => {
    setTeamFilters((filters) =>
      filters.map((filter) => (filter.id === id ? { ...filter, checked } : filter)),
    );
  };

  const toggleServiceFilter = (id: string, checked: boolean) => {
    setServiceFilters((filters) =>
      filters.map((filter) => (filter.id === id ? { ...filter, checked } : filter)),
    );
  };

  return (
    <Layout>
      <Sidebar>
        <MainHeader
          title="Agenda"
          action={<Button iconOnly="bottom" text="Agregar turno" icon={<CalendarPlus size={20} />} />}
        />
        <Calendar />
        <Filters
          title="Equipo"
          options={teamFilters}
          onToggleOption={toggleTeamFilter}
        />
        <Filters
          title="Servicios"
          options={serviceFilters}
          onToggleOption={toggleServiceFilter}
        />
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
