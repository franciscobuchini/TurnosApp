/* 
  src/pages/admin/Agenda.tsx
  Calendario de turnos para el usuario admin.
*/

import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import MainContent from '../../components/layout/MainContent';
import Calendar from '../../components/widgets/Calendar';
import DetailsPanel from '../../components/widgets/DetailsPanel';
import { getTeamFilters, getServiceFilters, getClientFilters } from '../../variables/data.ts';
import { getSelectedMembers } from '../../functions/teamFilters';
import Schedule from '../../components/widgets/Schedule';
import WeekSelector from '../../components/widgets/WeekSelector';
import HideButton from '../../components/buttons/HideButton';
import DetailsButton from '../../components/buttons/DetailsButton';

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
  const [teamFilters] = useState(getTeamFilters);
  const [serviceFilters] = useState(getServiceFilters);
  const [clientFilters] = useState(getClientFilters);

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

  return (
    <Layout>
      <Sidebar>
        <Calendar selectedDate={selectedDate} onSelectDate={selectDate} />
        <DetailsPanel
          title="Equipo"
          options={teamFilters}
          renderDropdownItems={() => [
            <HideButton key="team-toggle" className="w-full justify-between" />,
            <DetailsButton key="team-details" text="Ver perfil" className="w-full justify-between" />,
          ]}
          actionLabel="Agregar miembro"
        />
        <DetailsPanel
          title="Servicios"
          options={serviceFilters}
          renderDropdownItems={() => [
            <HideButton key="service-toggle" className="w-full justify-between" />,
            <DetailsButton key="service-details" text="Detalles" className="w-full justify-between" />,
          ]}
          actionLabel="Agregar producto"
        />
        <DetailsPanel
          title="Clientes"
          options={clientFilters}
          renderDropdownItems={() => [
            <HideButton key="client-toggle" className="w-full justify-between" />,
            <DetailsButton key="client-details" text="Detalles" className="w-full justify-between" />,
          ]}
          actionLabel="Agregar cliente"
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