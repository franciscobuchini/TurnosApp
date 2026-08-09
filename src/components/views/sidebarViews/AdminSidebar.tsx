/*
  src/components/views/sidebarViews/AdminSidebar.tsx
  Estado por defecto de la sidebar del admin (agenda): header "minube.site"
  con botón de ajustes, Calendario y los paneles Equipo/Servicios/Clientes.
*/

import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import Sidebar from '../../layout/Sidebar';
import Calendar from '../../widgets/sidebarWidgets/Calendar';
import DetailsPanel, {
  type DetailsPanelOption,
} from '../../widgets/sidebarWidgets/DetailsPanel';
import type { FiltersOption } from '../../../database/types';
import AddEntityButton from '../../buttons/AddEntityButton';
import AddServiceButton from '../../buttons/AddServiceButton';
import AddClientButton from '../../buttons/AddClientButton';
import TeamFilterButton from '../../buttons/TeamFilterButton';
import ServiceFilterButton from '../../buttons/ServiceFilterButton';
import ClientFilterButton from '../../buttons/ClientFilterButton';

interface AdminSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  teamFilters: FiltersOption[];
  toggleTeamFilter: (id: string, checked: boolean) => void;
  serviceFilters: DetailsPanelOption[];
  toggleServiceFilter: (id: string, checked: boolean) => void;
  clientFilters: FiltersOption[];
  onOpenSettings: () => void;
}

export default function AdminSidebar({
  selectedDate,
  onSelectDate,
  teamFilters,
  toggleTeamFilter,
  serviceFilters,
  toggleServiceFilter,
  clientFilters,
  onOpenSettings,
}: AdminSidebarProps) {
  const navigate = useNavigate();

  return (
    <Sidebar
      headerAction={
        <button
          type="button"
          aria-label="Ajustes"
          className="flex h-(--size-2xl) w-(--size-2xl) cursor-pointer items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-50"
          onClick={onOpenSettings}
        >
          <MoreVertical size={18} />
        </button>
      }
    >
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
        action={<AddEntityButton onOpen={() => navigate('/admin/miembro')} />}
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
        action={<AddServiceButton onOpen={() => navigate('/admin/servicio')} />}
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
        action={<AddClientButton onOpen={() => navigate('/admin/cliente')} />}
      />
    </Sidebar>
  );
}