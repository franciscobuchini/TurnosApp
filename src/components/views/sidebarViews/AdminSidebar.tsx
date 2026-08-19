/*
  src/components/views/sidebarViews/AdminSidebar.tsx
  Estado por defecto de la sidebar del admin (agenda): header "minube.site"
  con botón de ajustes, Calendario y los paneles Equipo/Servicios/Clientes.

  Equipo y Servicios comparten el mismo esqueleto (title → options →
  renderDropdownItems → action con AddEntityLauncherButton) y solo varían en
  qué fila/vista/ruta usan — arman un array de config en vez de repetir el
  bloque `<DetailsPanel>` 2 veces. `ClientFilterButton` no tiene concepto de
  mostrar/ocultar (no acepta `onToggle`, a diferencia de Team/Service).

  Clientes queda afuera de ese array: es buscador y alta en uno, igual que el
  paso "Seleccionar cliente" de "Agregar turno" (ver AddShiftSidebar) — se
  tipea el nombre, la lista de abajo filtra en vivo (fuzzyMatch) y, si no
  hay un cliente con ese nombre exacto, aparece un mini-formulario (WhatsApp
  + notas opcionales) para darlo de alta ahí mismo. Por eso usa el
  `children` de DetailsPanel (reemplaza su options/action por defecto) en
  vez del esqueleto compartido, reutilizando igual `DetailsPanelOptionRow`
  para que cada fila se vea y funcione idéntico a las de Equipo/Servicios
  (mismo Dropdown con "Ver detalles").

  La confirmación de "Desactivar" un servicio vive acá (no adentro de
  ServiceFilterButton): ese botón se renderiza como ítem de un Dropdown, que
  se cierra y desmonta su contenido ante cualquier click adentro — un
  ConfirmDialog declarado ahí nunca llegaría a mostrarse. Acá, en cambio,
  este componente no está dentro de ningún Popover, así que el dialog
  sobrevive al cierre del menú.
*/

import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import Sidebar from '../../layout/Sidebar';
import Calendar from '../../widgets/sidebarWidgets/Calendar';
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

interface AdminSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  teamFilters: FiltersOption[];
  toggleTeamFilter: (id: string, checked: boolean) => void;
  serviceFilters: DetailsPanelOption[];
  toggleServiceActive: (id: string, active: boolean) => void;
  clientFilters: FiltersOption[];
  /** Da de alta un cliente nuevo desde el buscador del panel Clientes —
      mismo paso único "buscar y crear" que el flujo "Agregar turno". */
  onAddClient: (client: { name: string; phone: string; notes?: string }) => void;
}

/* Mismas clases que el buscador de cliente de AddShiftSidebar (ver
   CLIENT_LIST_CLASS/NEW_CLIENT_SECTION_CLASS ahí) — panel distinto, misma
   lógica de "buscar y crear en un paso", así que se ve igual. Envueltas en
   un solo div (CLIENT_SEARCH_BODY_CLASS) en vez de vivir sueltas como
   hijos directos del body del panel: así el gap entre buscador/lista/alta
   no depende de FILTER_PANEL_BODY_CLASS (compartida con Equipo/Servicios,
   que no llevan gap entre su lista y el botón "Agregar un nuevo..."). */
const CLIENT_SEARCH_BODY_CLASS = 'flex flex-col gap-2 flex-1 min-h-0';
const CLIENT_SEARCH_LIST_CLASS = 'flex flex-col flex-1 min-h-0 overflow-y-auto';
const NEW_CLIENT_SECTION_CLASS = 'flex flex-col gap-3 shrink-0';
const NEW_CLIENT_SECTION_SEPARATOR_CLASS = 'border-t border-border/60 pt-3';
const NEW_CLIENT_HINT_CLASS = 'px-1 text-xs text-muted-foreground';

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
  onAddClient,
}: AdminSidebarProps) {
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

        <DetailsPanel title="Clientes">
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
