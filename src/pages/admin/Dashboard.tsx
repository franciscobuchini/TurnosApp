/*
  src/pages/admin/Dashboard.tsx
*/

import { useState } from 'react';
import { useAgendaDate } from '../../functions/agendaDate';
import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import MainContent from '../../components/layout/MainContent';
import Calendar from '../../components/widgets/Calendar';
import DetailsPanel from '../../components/widgets/DetailsPanel';
import { getTeamFilters, getServiceFilters, getClientFilters } from '../../variables/data';
import { useTeamFilters } from '../../functions/teamFilters';
import AddMemberButton from '../../components/buttons/AddMemberButton';
import AddServiceButton from '../../components/buttons/AddServiceButton';
import AddClientButton from '../../components/buttons/AddClientButton';
import TeamFilterButton from '../../components/buttons/TeamFilterButton';
import ServiceFilterButton from '../../components/buttons/ServiceFilterButton';
import ClientFilterButton from '../../components/buttons/ClientFilterButton';
import ScheduleView from '../../components/views/ScheduleView';
import AddEntityView from '../../components/views/AddEntityView';
import AddServiceView from '../../components/views/AddServiceView';
import AddClientView from '../../components/views/AddClientView';
import ViewEntityView from '../../components/views/ViewEntityView';
import ViewServiceView from '../../components/views/ViewServiceView';
import ViewClientView from '../../components/views/ViewClientView';

function Dashboard() {
  const { teamFilters, selectedMembers, toggleTeamFilter } = useTeamFilters(getTeamFilters);
  const [serviceFilters] = useState(getServiceFilters);
  const { viewDate, selectedDate, setViewDate, setSelectedDate, selectDate } = useAgendaDate();
  const [clientFilters] = useState(getClientFilters);
  const [activeView, setActiveView] = useState<
    | { type: 'schedule' }
    | { type: 'add-member' }
    | { type: 'add-service' }
    | { type: 'add-client' }
    | { type: 'view-member'; name: string }
    | { type: 'view-service'; name: string }
    | { type: 'view-client'; name: string }
  >({ type: 'schedule' });

  return (
    <Layout>
      <Sidebar>
        <Calendar selectedDate={selectedDate} onSelectDate={selectDate} />
        <DetailsPanel
          title="Equipo"
          options={teamFilters}
          renderDropdownItems={(option) => [
            <TeamFilterButton
              key={`${option.id}-toggle`}
              option={option}
              onToggle={toggleTeamFilter}
              onOpenDetails={() => setActiveView({ type: 'view-member', name: option.label })}
            />,
          ]}
          action={<AddMemberButton onOpen={() => setActiveView({ type: 'add-member' })} />}
        />
        <DetailsPanel
          title="Servicios"
          options={serviceFilters}
          renderDropdownItems={(option) => [
            <ServiceFilterButton
              key={`${option.id}-toggle`}
              option={option}
              onOpenDetails={() => setActiveView({ type: 'view-service', name: option.label })}
            />,
          ]}
          action={<AddServiceButton onOpen={() => setActiveView({ type: 'add-service' })} />}
        />
        <DetailsPanel
          title="Clientes"
          options={clientFilters}
          renderDropdownItems={(option) => [
            <ClientFilterButton
              key={`${option.id}-toggle`}
              option={option}
              onOpenDetails={() => setActiveView({ type: 'view-client', name: option.label })}
            />,
          ]}
          action={<AddClientButton onOpen={() => setActiveView({ type: 'add-client' })} />}
        />
      </Sidebar>
      <MainContent>
        {activeView.type === 'add-member' ? (
          <AddEntityView open={true} onClose={() => setActiveView({ type: 'schedule' })} />
        ) : activeView.type === 'add-service' ? (
          <AddServiceView open={true} onClose={() => setActiveView({ type: 'schedule' })} />
        ) : activeView.type === 'add-client' ? (
          <AddClientView open={true} onClose={() => setActiveView({ type: 'schedule' })} />
        ) : activeView.type === 'view-member' ? (
          <ViewEntityView
            open={true}
            onClose={() => setActiveView({ type: 'schedule' })}
            title={`Perfil de ${activeView.name}`}
          />
        ) : activeView.type === 'view-service' ? (
          <ViewServiceView
            open={true}
            onClose={() => setActiveView({ type: 'schedule' })}
            title={`Detalles de ${activeView.name}`}
          />
        ) : activeView.type === 'view-client' ? (
          <ViewClientView
            open={true}
            onClose={() => setActiveView({ type: 'schedule' })}
            title={`Detalles de ${activeView.name}`}
          />
        ) : (
          <ScheduleView
            selectedMembers={selectedMembers}
            viewDate={viewDate}
            selectedDate={selectedDate}
            onViewDateChange={setViewDate}
            onSelectDate={setSelectedDate}
            onSelectDateFull={selectDate}
          />
        )}
      </MainContent>
    </Layout>
  );
}

export default Dashboard;
