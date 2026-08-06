/*
  src/pages/admin/Dashboard.tsx
*/

import { useMemo, useState } from 'react';
import { useAgendaDate } from '../../functions/agendaDate';
import Layout from '../../components/layout/Layout';
import Calendar from '../../components/widgets/sidebarWidgets/Calendar';
import DetailsPanel from '../../components/widgets/sidebarWidgets/DetailsPanel';
import { getClients, getTeamFilters, getServiceFilters } from '../../database/data';
import type { Client, FiltersOption } from '../../database/types';
import { useTeamFilters } from '../../functions/teamFilters';
import AddEntityButton from '../../components/buttons/AddEntityButton';
import AddServiceButton from '../../components/buttons/AddServiceButton';
import AddClientButton from '../../components/buttons/AddClientButton';
import TeamFilterButton from '../../components/buttons/TeamFilterButton';
import ServiceFilterButton from '../../components/buttons/ServiceFilterButton';
import ClientFilterButton from '../../components/buttons/ClientFilterButton';
import ScheduleView from '../../components/views/ScheduleView';
import AddEntityView from '../../components/views/EntityView';
import AddServiceView from '../../components/views/ServiceView';
import AddClientView from '../../components/views/ClientView';
import ViewServiceView from '../../components/views/ServiceView';
import ViewClientView from '../../components/views/ClientView';

type ActiveView =
  | { type: 'schedule' }
  | { type: 'add-member' }
  | { type: 'add-service' }
  | { type: 'add-client' }
  | { type: 'view-member'; name: string }
  | { type: 'view-service'; name: string }
  | { type: 'view-client'; name: string }
  | { type: 'edit-client'; name: string };

function normalizeClientName(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function Dashboard() {
  const { teamFilters, selectedMembers, toggleTeamFilter } = useTeamFilters(getTeamFilters);
  const [serviceFilters, setServiceFilters] = useState(getServiceFilters);

  const toggleServiceFilter = (id: string, checked: boolean) => {
    setServiceFilters((current) =>
      current.map((f) => (f.id === id ? { ...f, checked } : f)),
    );
  };
  const { viewDate, selectedDate, setViewDate, setSelectedDate, selectDate } = useAgendaDate();
  const [clients, setClients] = useState<Client[]>(() => getClients());
  const [activeView, setActiveView] = useState<ActiveView>({ type: 'schedule' });
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);

  const clientFilters = useMemo<FiltersOption[]>(() => {
    const seen = new Set<string>();

    return clients.reduce<FiltersOption[]>((accumulator, client) => {
      if (!client.name || seen.has(client.name)) {
        return accumulator;
      }

      seen.add(client.name);
      accumulator.push({
        id: client.name.toLowerCase().replace(/\s+/g, '-'),
        label: client.name,
        checked: true,
      });

      return accumulator;
    }, []);
  }, [clients]);

  const handleCreateClient = (client: Client) => {
    setClients((currentClients) => [...currentClients, { ...client, appointmentsCount: 0, totalSpent: 0 }]);
    setSelectedClientName(client.name);
    setActiveView({ type: 'schedule' });
  };

  const handleOpenClientDetails = (clientName: string) => {
    setActiveView({ type: 'view-client', name: clientName });
  };

  const handleOpenClientEdit = (clientName: string) => {
    setActiveView({ type: 'edit-client', name: clientName });
  };

  const handleUpdateClient = (client: Client) => {
    const previousClientName = activeView.type === 'view-client' ? activeView.name : selectedClientName ?? '';

    setClients((currentClients) =>
      currentClients.map((currentClient) =>
        normalizeClientName(currentClient.name) === normalizeClientName(previousClientName)
          ? { ...currentClient, ...client }
          : currentClient,
      ),
    );
    setSelectedClientName(client.name);
    setActiveView({ type: 'schedule' });
  };

  return (
    <Layout
      sidebarChildren={
        <>
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
            action={<AddEntityButton onOpen={() => setActiveView({ type: 'add-member' })} />}
          />
          <DetailsPanel
            title="Servicios"
            options={serviceFilters}
            renderDropdownItems={(option) => [
              <ServiceFilterButton
                key={`${option.id}-toggle`}
                option={option}
                onToggle={toggleServiceFilter}
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
                onOpenDetails={() => handleOpenClientDetails(option.label)}
              />,
            ]}
            action={<AddClientButton onOpen={() => setActiveView({ type: 'add-client' })} />}
          />
        </>
      }
    >
      {activeView.type === 'add-member' ? (
        <AddEntityView open={true} onClose={() => setActiveView({ type: 'schedule' })} />
      ) : activeView.type === 'add-service' ? (
        <AddServiceView open={true} onClose={() => setActiveView({ type: 'schedule' })} />
      ) : activeView.type === 'add-client' ? (
        <AddClientView
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          clients={clients}
          onConfirm={handleCreateClient}
        />
      ) : activeView.type === 'view-member' ? (
        <AddEntityView
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          title={`Perfil de ${activeView.name}`}
          mode="view"
          memberName={activeView.name}
        />
      ) : activeView.type === 'view-service' ? (
        <ViewServiceView
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          title={`Detalles de ${activeView.name}`}
          mode="view"
        />
      ) : activeView.type === 'view-client' ? (
        <ViewClientView
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          title={`Acerca de ${activeView.name}`}
          mode="view"
          clientName={activeView.name}
          clients={clients}
          onConfirm={handleUpdateClient}
          onEdit={() => handleOpenClientEdit(activeView.name)}
          onCancel={() => setActiveView({ type: 'schedule' })}
        />
      ) : activeView.type === 'edit-client' ? (
        <ViewClientView
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          title={`Editar ${activeView.name}`}
          mode="edit"
          clientName={activeView.name}
          clients={clients}
          onConfirm={handleUpdateClient}
          onCancel={() => setActiveView({ type: 'view-client', name: activeView.name })}
        />
      ) : (
        <ScheduleView
          selectedMembers={selectedMembers}
          viewDate={viewDate}
          selectedDate={selectedDate}
          onViewDateChange={setViewDate}
          onSelectDate={setSelectedDate}
          selectedClientName={selectedClientName ?? undefined}
        />
      )}
    </Layout>
  );
}

export default Dashboard;