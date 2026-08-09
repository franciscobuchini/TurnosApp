/*
  src/pages/admin/Dashboard.tsx
  Layout del panel de admin: arma el Layout con la Sidebar (paneles de
  calendario/equipo/servicios/clientes) y renderiza la vista activa según la
  ruta (react-router) mediante <Outlet>. Las vistas viven en
  src/components/views y tienen ruta propia.
*/

import { useMemo, useState } from 'react';
import { type NavigateFunction, Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import { useAgendaDate } from '../../functions/agendaDate';
import Layout from '../../components/layout/Layout';
import {
  getClients,
  getTeamFilters,
  addClient,
  updateClient as dbUpdateClient,
  addService,
  updateService as dbUpdateService,
  addTeamMember,
  updateTeamMember,
  getservices,
  removeClient,
  removeService,
  removeTeamMember,
} from '../../database/data';
import type { Client, FiltersOption, service, TeamMember } from '../../database/types';
import { useTeamFilters } from '../../functions/teamFilters';
import { SERVICE_COLOR_BY_ID } from '../../components/widgets/serviceWidgets/serviceColors';
import type { DetailsPanelOption } from '../../components/widgets/sidebarWidgets/DetailsPanel';
import AdminSidebar from '../../components/views/sidebarViews/AdminSidebar';
import AddShiftSidebar from '../../components/views/sidebarViews/AddShiftSidebar';

export interface AdminContext {
  teamFilters: FiltersOption[];
  selectedMembers: string[];
  toggleTeamFilter: (id: string, checked: boolean) => void;
  serviceFilters: DetailsPanelOption[];
  toggleServiceFilter: (id: string, checked: boolean) => void;
  clients: Client[];
  clientFilters: FiltersOption[];
  selectedClientName: string | null;
  viewDate: Date;
  selectedDate: Date;
  setViewDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  navigate: NavigateFunction;
  addShiftOpen: boolean;
  openAddShift: () => void;
  closeAddShift: () => void;
  createMember: (member: TeamMember) => void;
  updateMember: (previousName: string, member: TeamMember) => void;
  deleteMember: (name: string) => void;
  createService: (newService: service) => void;
  updateService: (previousName: string, updated: service) => void;
  deleteService: (name: string) => void;
  createClient: (client: Client) => void;
  updateClient: (previousName: string, updated: Client) => void;
  deleteClient: (name: string) => void;
}

function Dashboard() {
  const navigate = useNavigate();
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
  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const openAddShift = () => setAddShiftOpen(true);
  const closeAddShift = () => setAddShiftOpen(false);
  const { viewDate, selectedDate, setViewDate, setSelectedDate, selectDate } = useAgendaDate();
  const [clients, setClients] = useState<Client[]>(() => getClients());
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

  const createMember = (member: TeamMember) => {
    addTeamMember(member);
    navigate('/admin');
  };

  const updateMember = (previousName: string, member: TeamMember) => {
    updateTeamMember(previousName, member);
    navigate(`/admin/miembro/${encodeURIComponent(member.name)}`);
  };

  const deleteMember = (name: string) => {
    removeTeamMember(name);
    removeTeamFilter(name);
    navigate('/admin');
  };

  const createService = (newService: service) => {
    addService(newService);
    navigate('/admin');
  };

  const updateService = (previousName: string, updated: service) => {
    dbUpdateService(previousName, updated);
    navigate(`/admin/servicio/${encodeURIComponent(updated.name)}`);
  };

  const deleteService = (name: string) => {
    removeService(name);
    setServiceFilters((current) => current.filter((f) => f.label !== name));
    navigate('/admin');
  };

  const createClient = (client: Client) => {
    addClient({ ...client, appointmentsCount: 0, totalSpent: 0 });
    setClients(getClients());
    setSelectedClientName(client.name);
    navigate('/admin');
  };

  const updateClient = (previousName: string, updated: Client) => {
    dbUpdateClient(previousName, updated);
    setClients(getClients());
    setSelectedClientName(updated.name);
    navigate(`/admin/cliente/${encodeURIComponent(updated.name)}`);
  };

  const deleteClient = (name: string) => {
    removeClient(name);
    setClients(getClients());
    navigate('/admin');
  };

  const context: AdminContext = {
    teamFilters,
    selectedMembers,
    toggleTeamFilter,
    serviceFilters,
    toggleServiceFilter,
    clients,
    clientFilters,
    selectedClientName,
    viewDate,
    selectedDate,
    setViewDate,
    setSelectedDate,
    navigate,
    addShiftOpen,
    openAddShift,
    closeAddShift,
    createMember,
    updateMember,
    deleteMember,
    createService,
    updateService,
    deleteService,
    createClient,
    updateClient,
    deleteClient,
  };

  return (
    <Layout
      sidebar={
        addShiftOpen ? (
          <AddShiftSidebar
            serviceFilters={serviceFilters}
            toggleServiceFilter={toggleServiceFilter}
            onClose={closeAddShift}
          />
        ) : (
          <AdminSidebar
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            teamFilters={teamFilters}
            toggleTeamFilter={toggleTeamFilter}
            serviceFilters={serviceFilters}
            toggleServiceFilter={toggleServiceFilter}
            clientFilters={clientFilters}
            onOpenSettings={() => navigate('/SettingsView')}
          />
        )
      }
    >
      <Outlet context={context} />
    </Layout>
  );
}

export function useAdminContext(): AdminContext {
  return useOutletContext<AdminContext>();
}

export default Dashboard;