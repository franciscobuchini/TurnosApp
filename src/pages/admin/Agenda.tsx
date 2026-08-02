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
import FilterPanel from '../../components/widgets/FilterPanel';
import { getTeamFilters, getServiceFilters, getClientFilters } from '../../variables/data.ts';
import { getSelectedMembers } from '../../functions/teamFilters';
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
  const [teamFilters, setTeamFilters] = useState(getTeamFilters);
  const [serviceFilters, setServiceFilters] = useState(getServiceFilters);
  const [clientFilters, setClientFilters] = useState(getClientFilters);

  const weekDays = getWeekDays(viewDate);
  const selectedMembers = getSelectedMembers(teamFilters);

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

  const selectDate = (date: Date) => {
    setViewDate(date);
    setSelectedDate(date);
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

  const toggleClientFilter = (id: string, checked: boolean) => {
    setClientFilters((filters) =>
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
        <Calendar selectedDate={selectedDate} onSelectDate={selectDate} />
        <FilterPanel
          title="Equipo"
          options={teamFilters}
          onToggleOption={toggleTeamFilter}
          actionLabel="+ Agregar miembro"
          onActionClick={() => console.log('Agregar miembro clicked')}
        />
        <FilterPanel
          title="Servicios"
          options={serviceFilters}
          onToggleOption={toggleServiceFilter}
          actionLabel="+ Agregar producto"
          onActionClick={() => console.log('Agregar producto clicked')}
        />
        <FilterPanel
          title="Clientes"
          options={clientFilters}
          onToggleOption={toggleClientFilter}
          actionLabel="+ Agregar cliente"
          onActionClick={() => console.log('Agregar cliente clicked')}
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
        <Schedule selectedDate={selectedDate} members={selectedMembers} />
      </MainContent>
    </Layout>
  );
}
export default Agenda;