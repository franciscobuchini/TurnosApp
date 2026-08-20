/*
  src/components/views/sidebarViews/EntitySidebarPanel.tsx
  Sidebar de Equipo/Servicios/Clientes cuando se abren desde AppMenubar (ver
  sidebarPanel en Dashboard.tsx): reemplaza toda la sidebar (igual que
  Agregar turno/Notificaciones), mostrando sólo el panel elegido — el
  maincontent no cambia, sigue mostrando ScheduleView siempre (AppMenubar ya
  se encarga de volver a /admin al abrir cualquiera de los tres, ver
  handleSidebarPanelClick ahí).

  Antes los tres vivían como acordeón (DetailsPanel con name compartido)
  dentro de AdminSidebar.tsx, junto al Calendar. Acá cada uno ocupa la
  sidebar entera con un solo DetailsPanel siempre `open`, cuyo chevron
  cierra el panel (onClose) en vez de competir por espacio con otro
  acordeón — mismo patrón que ya usan "Crear un nuevo turno"/"Seleccionar
  cliente" en AddShiftSidebar.tsx.

  El resto (búsqueda/alta de cliente, confirmación de "¿Desactivar
  servicio?") es la misma lógica que tenía AdminSidebar.tsx: sólo se movió
  acá, no se rediseñó.
*/

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import Sidebar from '../../layout/Sidebar';
import type { SidebarPanel } from '../../layout/AppMenubar';
import DetailsPanel, {
  DetailsPanelOptionRow,
  type DetailsPanelOption,
} from '../../widgets/sidebarWidgets/DetailsPanel';
import ConfirmDialog from '../../ui/confirm-dialog';
import { Input } from '../../ui/input';
import type { FiltersOption } from '../../../database/types';
import { getAppointments } from '../../../database/data';
import { fuzzyMatch } from '../../../utils/fuzzyMatch';
import AddEntityLauncherButton from '../../buttons/AddEntityLauncherButton';
import ConfirmButton from '../../buttons/ConfirmButton';
import WhatsAppInput, { WHATSAPP_PREFIX } from '../../widgets/WhatsAppInput';
import { TeamFilterButton, ServiceFilterButton, ClientFilterButton } from '../../widgets/sidebarWidgets/DropdownRowActions';
import AddEntityView, { ADD_ENTITY_VIEW_TITLE } from '../EntityView';
import AddServiceView, { ADD_SERVICE_VIEW_TITLE } from '../ServiceView';

interface EntitySidebarPanelProps {
  panel: SidebarPanel;
  /** El chevron del DetailsPanel (siempre `open`) dispara esto al
      colapsarse — vuelve a la sidebar por defecto (Calendar + Notificaciones). */
  onClose: () => void;
  teamFilters: FiltersOption[];
  toggleTeamFilter: (id: string, checked: boolean) => void;
  serviceFilters: DetailsPanelOption[];
  toggleServiceActive: (id: string, active: boolean) => void;
  clientFilters: FiltersOption[];
  /** Da de alta un cliente nuevo desde el buscador del panel Clientes. */
  onAddClient: (client: { name: string; phone: string; notes?: string }) => void;
}

/* Mismas clases que el buscador de cliente de AddShiftSidebar/AdminSidebar
   (panel distinto, misma lógica de "buscar y crear en un paso"). */
const CLIENT_SEARCH_BODY_CLASS = 'flex flex-col gap-2 flex-1 min-h-0';
const CLIENT_SEARCH_LIST_CLASS = 'flex flex-col flex-1 min-h-0 overflow-y-auto';
const NEW_CLIENT_SECTION_CLASS = 'flex flex-col gap-3 shrink-0';
const NEW_CLIENT_SECTION_SEPARATOR_CLASS = 'border-t border-border/60 pt-3';
const NEW_CLIENT_HINT_CLASS = 'px-1 text-xs text-muted-foreground';

export default function EntitySidebarPanel({
  panel,
  onClose,
  teamFilters,
  toggleTeamFilter,
  serviceFilters,
  toggleServiceActive,
  clientFilters,
  onAddClient,
}: EntitySidebarPanelProps) {
  const navigate = useNavigate();

  const [clientQuery, setClientQuery] = useState('');
  const [newClientWhatsapp, setNewClientWhatsapp] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  const trimmedClientQuery = clientQuery.trim();
  const filteredClients = trimmedClientQuery
    ? clientFilters.filter((client) => fuzzyMatch(trimmedClientQuery, client.label))
    : clientFilters;
  // Si ya existe un cliente con ese nombre exacto, no tiene sentido
  // ofrecer crearlo de nuevo (ya está mostrado arriba, en la lista).
  const hasExactClientMatch = clientFilters.some(
    (client) => client.label.trim().toLowerCase() === trimmedClientQuery.toLowerCase(),
  );
  const showNewClientSection = Boolean(trimmedClientQuery) && !hasExactClientMatch;
  const isNewClientValid = showNewClientSection && Boolean(newClientWhatsapp.replace(WHATSAPP_PREFIX, '').trim());

  const handleAddClient = () => {
    onAddClient({
      name: trimmedClientQuery,
      phone: newClientWhatsapp,
      notes: newClientNotes.trim() || undefined,
    });
    setClientQuery('');
    setNewClientWhatsapp('');
    setNewClientNotes('');
  };

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

  return (
    <>
      <Sidebar expandOpenPanel>
        {panel === 'team' && (
          <DetailsPanel
            title="Equipo"
            options={teamFilters}
            renderDropdownItems={(option) => [
              <TeamFilterButton
                key="row"
                option={option}
                onToggle={toggleTeamFilter}
                onOpenDetails={() => navigate(`/admin/miembro/${encodeURIComponent(option.label)}`)}
              />,
            ]}
            action={
              <AddEntityLauncherButton
                title={ADD_ENTITY_VIEW_TITLE}
                onOpen={() => navigate('/admin/miembro')}
                renderView={({ open, onClose: onCloseView }) => (
                  <AddEntityView open={open} onClose={onCloseView} title={ADD_ENTITY_VIEW_TITLE} />
                )}
              />
            }
            open
            onToggle={(e) => {
              if (!e.currentTarget.open) onClose();
            }}
          />
        )}

        {panel === 'services' && (
          <DetailsPanel
            title="Servicios"
            options={serviceFilters}
            renderDropdownItems={(option) => [
              <ServiceFilterButton
                key="row"
                option={option}
                onToggleActive={handleToggleServiceActive}
                onOpenDetails={() => navigate(`/admin/servicio/${encodeURIComponent(option.label)}`)}
              />,
            ]}
            action={
              <AddEntityLauncherButton
                title={ADD_SERVICE_VIEW_TITLE}
                onOpen={() => navigate('/admin/servicio')}
                renderView={({ open, onClose: onCloseView }) => (
                  <AddServiceView open={open} onClose={onCloseView} title={ADD_SERVICE_VIEW_TITLE} />
                )}
              />
            }
            open
            onToggle={(e) => {
              if (!e.currentTarget.open) onClose();
            }}
          />
        )}

        {panel === 'clients' && (
          <DetailsPanel
            title="Clientes"
            open
            onToggle={(e) => {
              if (!e.currentTarget.open) onClose();
            }}
          >
            <div className={CLIENT_SEARCH_BODY_CLASS}>
              <Input
                name="client-search"
                placeholder="Buscar o crear cliente..."
                value={clientQuery}
                onChange={(event) => setClientQuery(event.target.value)}
                className="shrink-0"
              />

              {filteredClients.length > 0 && (
                <div className={CLIENT_SEARCH_LIST_CLASS}>
                  {filteredClients.map((option) => (
                    <DetailsPanelOptionRow
                      key={option.id}
                      option={option}
                      renderDropdownItems={(opt) => [
                        <ClientFilterButton
                          key="details"
                          option={opt}
                          onOpenDetails={() => navigate(`/admin/cliente/${encodeURIComponent(opt.label)}`)}
                        />,
                      ]}
                    />
                  ))}
                </div>
              )}

              {showNewClientSection && (
                <div
                  className={twMerge(
                    NEW_CLIENT_SECTION_CLASS,
                    filteredClients.length > 0 && NEW_CLIENT_SECTION_SEPARATOR_CLASS,
                  )}
                >
                  <span className={NEW_CLIENT_HINT_CLASS}>
                    ¿No está en la lista? Completá estos datos para agregarlo como cliente nuevo.
                  </span>
                  <WhatsAppInput value={newClientWhatsapp} onChange={setNewClientWhatsapp} />
                  <Input
                    name="new-client-notes"
                    textarea
                    rows={2}
                    optional
                    label="Notas"
                    placeholder="Agregar notas..."
                    value={newClientNotes}
                    onChange={(event) => setNewClientNotes(event.target.value)}
                  />
                  <ConfirmButton
                    text="Agregar cliente"
                    disabled={!isNewClientValid}
                    onClick={handleAddClient}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </DetailsPanel>
        )}
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
