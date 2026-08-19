/*
  src/components/views/sidebarViews/AdminSidebar.tsx
  Estado por defecto de la sidebar del admin (agenda): header "minube.site"
  con botón de ajustes, Calendario y los paneles Equipo/Servicios/Clientes.

  Los 3 paneles comparten el mismo esqueleto (title → options →
  renderDropdownItems → action con AddEntityLauncherButton) y solo varían en
  qué fila/vista/ruta usan — arman un array de config en vez de repetir el
  bloque `<DetailsPanel>` 3 veces. `ClientFilterButton` no tiene concepto de
  mostrar/ocultar (no acepta `onToggle`, a diferencia de Team/Service), por
  eso cada entrada arma su propia fila vía `renderRow` en vez de pasar un
  componente + props genéricas.

  La confirmación de "Desactivar" un servicio vive acá (no adentro de
  ServiceFilterButton): ese botón se renderiza como ítem de un Dropdown, que
  se cierra y desmonta su contenido ante cualquier click adentro — un
  ConfirmDialog declarado ahí nunca llegaría a mostrarse. Acá, en cambio,
  este componente no está dentro de ningún Popover, así que el dialog
  sobrevive al cierre del menú.
*/

import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import Calendar from '../../widgets/sidebarWidgets/Calendar';
import DetailsPanel, {
  type DetailsPanelOption,
} from '../../widgets/sidebarWidgets/DetailsPanel';
import ConfirmDialog from '../../ui/confirm-dialog';
import type { FiltersOption } from '../../../database/types';
import { getAppointments } from '../../../database/data';
import AddEntityLauncherButton from '../../buttons/AddEntityLauncherButton';
import { TeamFilterButton, ServiceFilterButton, ClientFilterButton } from '../../widgets/sidebarWidgets/DropdownRowActions';
import AddEntityView, { ADD_ENTITY_VIEW_TITLE } from '../EntityView';
import AddServiceView, { ADD_SERVICE_VIEW_TITLE } from '../ServiceView';
import AddClientView, { ADD_CLIENT_VIEW_TITLE } from '../ClientView';

interface AdminSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  teamFilters: FiltersOption[];
  toggleTeamFilter: (id: string, checked: boolean) => void;
  serviceFilters: DetailsPanelOption[];
  toggleServiceActive: (id: string, active: boolean) => void;
  clientFilters: FiltersOption[];
}

interface SidebarPanelConfig {
  title: string;
  options: DetailsPanelOption[];
  routeSegment: string;
  addViewTitle: string;
  renderRow: (option: DetailsPanelOption) => ReactNode;
  renderAddView: (props: { open: boolean; onClose: () => void }) => ReactNode;
}

export default function AdminSidebar({
  selectedDate,
  onSelectDate,
  teamFilters,
  toggleTeamFilter,
  serviceFilters,
  toggleServiceActive,
  clientFilters,
}: AdminSidebarProps) {
  const navigate = useNavigate();

  // Id del servicio que se está por desactivar, a la espera de confirmación
  // (null = no hay ninguna pendiente). Reactivar no pasa por acá: no hay
  // nada que perder, se aplica directo.
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null);
  const pendingService = serviceFilters.find((f) => f.id === pendingDeactivateId);

  const handleToggleServiceActive = (id: string, active: boolean) => {
    if (!active) {
      // Solo pide confirmación si hay turnos futuros (o sin fecha pasada) con ese servicio.
      const serviceLabel = serviceFilters.find((f) => f.id === id)?.label;
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const hasAppointments = serviceLabel
        ? getAppointments().some((apt) => apt.service === serviceLabel && apt.date >= todayStr)
        : false;

      if (hasAppointments) {
        setPendingDeactivateId(id);
        return;
      }

      // Sin turnos afectados: desactivar sin confirmación.
      toggleServiceActive(id, false);
      return;
    }
    toggleServiceActive(id, true);
  };

  const panels: SidebarPanelConfig[] = [
    {
      title: 'Equipo',
      options: teamFilters,
      routeSegment: 'miembro',
      addViewTitle: ADD_ENTITY_VIEW_TITLE,
      renderRow: (option) => (
        <TeamFilterButton
          option={option}
          onToggle={toggleTeamFilter}
          onOpenDetails={() => navigate(`/admin/miembro/${encodeURIComponent(option.label)}`)}
        />
      ),
      renderAddView: ({ open, onClose }) => (
        <AddEntityView open={open} onClose={onClose} title={ADD_ENTITY_VIEW_TITLE} />
      ),
    },
    {
      title: 'Servicios',
      options: serviceFilters,
      routeSegment: 'servicio',
      addViewTitle: ADD_SERVICE_VIEW_TITLE,
      renderRow: (option) => (
        <ServiceFilterButton
          option={option}
          onToggleActive={handleToggleServiceActive}
          onOpenDetails={() => navigate(`/admin/servicio/${encodeURIComponent(option.label)}`)}
        />
      ),
      renderAddView: ({ open, onClose }) => (
        <AddServiceView open={open} onClose={onClose} title={ADD_SERVICE_VIEW_TITLE} />
      ),
    },
    {
      title: 'Clientes',
      options: clientFilters,
      routeSegment: 'cliente',
      addViewTitle: ADD_CLIENT_VIEW_TITLE,
      renderRow: (option) => (
        <ClientFilterButton
          option={option}
          onOpenDetails={() => navigate(`/admin/cliente/${encodeURIComponent(option.label)}`)}
        />
      ),
      renderAddView: ({ open, onClose }) => (
        <AddClientView open={open} onClose={onClose} title={ADD_CLIENT_VIEW_TITLE} />
      ),
    },
  ];

  return (
    <>
      <Sidebar expandOpenPanel>
        <Calendar selectedDate={selectedDate} onSelectDate={onSelectDate} />
        {panels.map((panel) => (
          <DetailsPanel
            key={panel.title}
            title={panel.title}
            options={panel.options}
            renderDropdownItems={(option) => [panel.renderRow(option)]}
            action={
              <AddEntityLauncherButton
                title={panel.addViewTitle}
                onOpen={() => navigate(`/admin/${panel.routeSegment}`)}
                renderView={panel.renderAddView}
              />
            }
          />
        ))}
      </Sidebar>

      {pendingService && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setPendingDeactivateId(null)}
          title={`¿Desactivar "${pendingService.label}"?`}
          description={`Este servicio se va a desactivar para tus clientes. Los turnos ya asignados de "${pendingService.label}" se van a mantener.`}
          confirmText="Desactivar"
          onConfirm={() => {
            toggleServiceActive(pendingService.id, false);
            setPendingDeactivateId(null);
          }}
          requirePin
        />
      )}
    </>
  );
}
