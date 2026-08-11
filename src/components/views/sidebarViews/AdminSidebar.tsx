/*
  src/components/views/sidebarViews/AdminSidebar.tsx
  Estado por defecto de la sidebar del admin (agenda): header "minube.site"
  con botón de ajustes, Calendario y los paneles Equipo/Servicios/Clientes.
*/

import { useNavigate } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import Calendar from '../../widgets/sidebarWidgets/Calendar';
import DetailsPanel, {
  type DetailsPanelOption,
} from '../../widgets/sidebarWidgets/DetailsPanel';
import type { FiltersOption } from '../../../database/types';
import AddEntityLauncherButton from '../../buttons/AddEntityLauncherButton';
import { TeamFilterButton, ServiceFilterButton, ClientFilterButton } from '../../widgets/sidebarWidgets/DropdownRowActions';
import AddEntityView, { ADD_ENTITY_VIEW_TITLE } from '../EntityView';
import AddServiceView, { ADD_SERVICE_VIEW_TITLE } from '../ServiceView';
import AddClientView, { ADD_CLIENT_VIEW_TITLE } from '../ClientView';
import { getBusiness } from '../../../database/data';

interface AdminSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  teamFilters: FiltersOption[];
  toggleTeamFilter: (id: string, checked: boolean) => void;
  serviceFilters: DetailsPanelOption[];
  toggleServiceFilter: (id: string, checked: boolean) => void;
  clientFilters: FiltersOption[];
}

export default function AdminSidebar({
  selectedDate,
  onSelectDate,
  teamFilters,
  toggleTeamFilter,
  serviceFilters,
  toggleServiceFilter,
  clientFilters,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const business = getBusiness();

  return (
    <Sidebar>
      <h2 data-sidebar-title className="p-6 text-xl font-semibold text-foreground truncate">{business.name}</h2>
      <Calendar selectedDate={selectedDate} onSelectDate={onSelectDate} />
      <DetailsPanel
        title="Equipo"
        options={teamFilters}
        renderDropdownItems={(option) => [
          <TeamFilterButton
            key={`${option.id}-toggle`}
            option={option}
            onToggle={toggleTeamFilter}
            onOpenDetails={() => navigate(`/admin/miembro/${encodeURIComponent(option.label)}`)}
          />,
        ]}
        action={
          <AddEntityLauncherButton
            title={ADD_ENTITY_VIEW_TITLE}
            onOpen={() => navigate('/admin/miembro')}
            renderView={({ open, onClose }) => (
              <AddEntityView open={open} onClose={onClose} title={ADD_ENTITY_VIEW_TITLE} />
            )}
          />
        }
      />
      <DetailsPanel
        title="Servicios"
        options={serviceFilters}
        renderDropdownItems={(option) => [
          <ServiceFilterButton
            key={`${option.id}-toggle`}
            option={option}
            onToggle={toggleServiceFilter}
            onOpenDetails={() => navigate(`/admin/servicio/${encodeURIComponent(option.label)}`)}
          />,
        ]}
        action={
          <AddEntityLauncherButton
            title={ADD_SERVICE_VIEW_TITLE}
            onOpen={() => navigate('/admin/servicio')}
            renderView={({ open, onClose }) => (
              <AddServiceView open={open} onClose={onClose} title={ADD_SERVICE_VIEW_TITLE} />
            )}
          />
        }
      />
      <DetailsPanel
        title="Clientes"
        options={clientFilters}
        renderDropdownItems={(option) => [
          <ClientFilterButton
            key={`${option.id}-toggle`}
            option={option}
            onOpenDetails={() => navigate(`/admin/cliente/${encodeURIComponent(option.label)}`)}
          />,
        ]}
        action={
          <AddEntityLauncherButton
            title={ADD_CLIENT_VIEW_TITLE}
            onOpen={() => navigate('/admin/cliente')}
            renderView={({ open, onClose }) => (
              <AddClientView open={open} onClose={onClose} title={ADD_CLIENT_VIEW_TITLE} />
            )}
          />
        }
      />
    </Sidebar>
  );
}