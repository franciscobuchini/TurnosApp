/*
  src/pages/admin/Dashboard.tsx
*/

import { useMemo, useState } from 'react';
import { useAgendaDate } from '../../functions/agendaDate';
import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import Calendar from '../../components/widgets/sidebarWidgets/Calendar';
import DetailsPanel from '../../components/widgets/sidebarWidgets/DetailsPanel';
import { getClients, getTeamFilters, addClient, updateClient, addService, updateService, addTeamMember, updateTeamMember, getservices, removeClient, removeService, removeTeamMember } from '../../database/data';
import type { Client, FiltersOption, service, TeamMember } from '../../database/types';
import { useTeamFilters } from '../../functions/teamFilters';
import { SERVICE_COLOR_BY_ID } from '../../components/widgets/serviceWidgets/serviceColors';
import type { DetailsPanelOption } from '../../components/widgets/sidebarWidgets/DetailsPanel';
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
  | { type: 'edit-client'; name: string }
  | { type: 'edit-service'; name: string };

function Dashboard() {
  const { teamFilters, selectedMembers, toggleTeamFilter, removeTeamFilter } = useTeamFilters(getTeamFilters);
  const [serviceFilters, setServiceFilters] = useState<DetailsPanelOption[]>(() =>
    getservices().map((service) => ({
      id: service.name.toLowerCase().replace(/\s+/g, '-'),
      label: service.name,
      checked: true,
      colorClassName: SERVICE_COLOR_BY_ID[service.colorId ?? '']?.className,
    })),
  );

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
    addClient({ ...client, appointmentsCount: 0, totalSpent: 0 });
    setClients(getClients());
    setSelectedClientName(client.name);
    setActiveView({ type: 'schedule' });
  };

  const handleOpenClientDetails = (clientName: string) => {
    setActiveView({ type: 'view-client', name: clientName });
  };

  const handleOpenClientEdit = (clientName: string) => {
    setActiveView({ type: 'edit-client', name: clientName });
  };

  const handleOpenServiceEdit = (serviceName: string) => {
    setActiveView({ type: 'edit-service', name: serviceName });
  };

  const handleUpdateClient = (client: Client) => {
    const previousClientName = activeView.type === 'view-client' ? activeView.name : selectedClientName ?? '';

    updateClient(previousClientName, client);
    setClients(getClients());
    setSelectedClientName(client.name);
    setActiveView({ type: 'view-client', name: client.name });
  };

  const handleCreateService = (newService: service) => {
    addService(newService);
    setActiveView({ type: 'schedule' });
  };

  const handleUpdateService = (previousName: string, updated: service) => {
    updateService(previousName, updated);
    setActiveView({ type: 'view-service', name: updated.name });
  };

  const handleCreateMember = (member: TeamMember) => {
    addTeamMember(member);
    setActiveView({ type: 'schedule' });
  };

  const handleUpdateMember = (previousName: string, member: TeamMember) => {
    updateTeamMember(previousName, member);
    setActiveView({ type: 'view-member', name: member.name });
  };

  const handleDeleteClient = (clientName: string) => {
    removeClient(clientName);
    setClients(getClients());
    setActiveView({ type: 'schedule' });
  };

  const handleDeleteService = (serviceName: string) => {
    removeService(serviceName);
    setServiceFilters((current) => current.filter((f) => f.label !== serviceName));
    setActiveView({ type: 'schedule' });
  };

  const handleDeleteMember = (memberName: string) => {
    removeTeamMember(memberName);
    removeTeamFilter(memberName);
    setActiveView({ type: 'schedule' });
  };

  return (
    <Layout
      sidebar={
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
        </Sidebar>
      }
    >
      {activeView.type === 'add-member' ? (
        <AddEntityView
          key="member-create"
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          onConfirm={handleCreateMember}
        />
      ) : activeView.type === 'add-service' ? (
        <AddServiceView
          key="service-create"
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          onConfirm={handleCreateService}
        />
      ) : activeView.type === 'add-client' ? (
        <AddClientView
          key="client-create"
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          clients={clients}
          onConfirm={handleCreateClient}
        />
      ) : activeView.type === 'view-member' ? (
        <AddEntityView
          key={`member-${activeView.name}`}
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          title={`Perfil de ${activeView.name}`}
          mode="view"
          memberName={activeView.name}
          onConfirm={(member) => handleUpdateMember(activeView.name, member)}
          onDelete={() => handleDeleteMember(activeView.name)}
        />
      ) : activeView.type === 'view-service' ? (
        <ViewServiceView
          key={`service-view-${activeView.name}`}
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          title={`Detalles de ${activeView.name}`}
          mode="view"
          serviceName={activeView.name}
          onEdit={() => handleOpenServiceEdit(activeView.name)}
          onCancel={() => setActiveView({ type: 'schedule' })}
          onDelete={() => handleDeleteService(activeView.name)}
        />
      ) : activeView.type === 'edit-service' ? (
        <ViewServiceView
          key={`service-edit-${activeView.name}`}
          open={true}
          onClose={() => setActiveView({ type: 'view-service', name: activeView.name })}
          title={`Editar ${activeView.name}`}
          mode="edit"
          serviceName={activeView.name}
          onConfirm={(updated) => handleUpdateService(activeView.name, updated)}
          onCancel={() => setActiveView({ type: 'view-service', name: activeView.name })}
          onDelete={() => handleDeleteService(activeView.name)}
        />
      ) : activeView.type === 'view-client' ? (
        <ViewClientView
          key={`client-view-${activeView.name}`}
          open={true}
          onClose={() => setActiveView({ type: 'schedule' })}
          title={`Acerca de ${activeView.name}`}
          mode="view"
          clientName={activeView.name}
          clients={clients}
          onConfirm={handleUpdateClient}
          onEdit={() => handleOpenClientEdit(activeView.name)}
          onCancel={() => setActiveView({ type: 'schedule' })}
          onDelete={() => handleDeleteClient(activeView.name)}
        />
      ) : activeView.type === 'edit-client' ? (
        <ViewClientView
          key={`client-edit-${activeView.name}`}
          open={true}
          onClose={() => setActiveView({ type: 'view-client', name: activeView.name })}
          title={`Editar ${activeView.name}`}
          mode="edit"
          clientName={activeView.name}
          clients={clients}
          onConfirm={handleUpdateClient}
          onCancel={() => setActiveView({ type: 'view-client', name: activeView.name })}
          onDelete={() => handleDeleteClient(activeView.name)}
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