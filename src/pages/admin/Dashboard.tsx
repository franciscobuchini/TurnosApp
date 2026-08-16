/*
  src/pages/admin/Dashboard.tsx
  Layout del panel de admin: arma el Layout con la Sidebar (paneles de
  calendario/equipo/servicios/clientes) y renderiza la vista activa según la
  ruta (react-router) mediante <Outlet>. Las vistas viven en
  src/components/views y tienen ruta propia.
*/

import { useEffect, useMemo, useState } from 'react';
import {
  type NavigateFunction,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom';
import { useAgendaDate } from '@/hooks/useAgendaDate';
import Layout from '../../components/layout/Layout';
import AppMenubar from '../../components/layout/AppMenubar';
import {
  getClients,
  getTeamFilters,
  addClient,
  updateClient as dbUpdateClient,
  addService,
  updateService as dbUpdateService,
  addTeamMember,
  updateTeamMember,
  addAppointment,
  updateAppointment,
  removeAppointment,
  addScheduleBlock,
  getservices,
  removeClient,
  removeService,
  removeTeamMember,
} from '../../database/data';
import type { Appointment, Client, FiltersOption, service, TeamMember } from '../../database/types';
import { useTeamFilters } from '@/hooks/useTeamFilters';
import { SERVICE_COLOR_BY_ID } from '../../components/widgets/serviceWidgets/serviceColors';
import type { DetailsPanelOption } from '../../components/widgets/sidebarWidgets/DetailsPanel';
import AdminSidebar from '../../components/views/sidebarViews/AdminSidebar';
import AddShiftSidebar from '../../components/views/sidebarViews/AddShiftSidebar';
import EditAppointmentSidebar from '../../components/views/sidebarViews/EditAppointmentSidebar';
import Toast from '../../components/ui/toast';
import { getFirstAvailableDate, parseServiceDurationMinutes } from '@/functions/bookingAvailability';

/** Cuántos días adelante se busca disponibilidad al elegir servicio en
    "Agregar turno" antes de avisar que no hay turnos. */
const SHIFT_AVAILABILITY_SEARCH_DAYS = 7;

/** Horario elegido en el Schedule para el turno en curso del flujo
    "Agregar turno", a la espera de que se elija el cliente. */
export interface ShiftSlot {
  member: string;
  date: string;
  startTime: string;
  endTime: string;
}

/** Fila elegida en el Schedule para el bloqueo en curso del flujo "Crear un
    nuevo bloqueo" > "Bloquear hora del negocio", a la espera de que se
    confirme — mismo shape que ScheduleBlock (types.ts) sin id/member, que
    acá siempre es "todo el negocio". */
export interface BlockRow {
  date: string;
  startTime: string;
  endTime: string;
}

export interface AdminContext {
  teamFilters: FiltersOption[];
  selectedMembers: string[];
  toggleTeamFilter: (id: string, checked: boolean) => void;
  serviceFilters: DetailsPanelOption[];
  toggleServiceFilter: (id: string, checked: boolean) => void;
  /** Persiste service.active (a diferencia de toggleServiceFilter, que sólo
      cambia el filtro local del calendario) — desactivar un servicio lo
      saca del turnero público. */
  toggleServiceActive: (id: string, active: boolean) => void;
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
  /** Servicio seleccionado en el flujo "Agregar turno" (nil si no hay selección). */
  shiftService: string | null;
  selectShiftService: (serviceName: string) => void;
  /** Horario elegido en el Schedule, a la espera de que se elija el cliente. */
  shiftSlot: ShiftSlot | null;
  selectShiftSlot: (slot: ShiftSlot) => void;
  /** Vuelve a la selección de horario sin cerrar el flujo (mantiene el servicio elegido). */
  cancelShiftSlot: () => void;
  /** Confirma el turno con el cliente elegido: lo persiste y cierra el flujo. */
  confirmShiftClient: (clientName: string) => void;
  /** Da de alta un cliente nuevo y confirma el turno con él, en un solo paso
      (buscador/alta combinados del paso "Seleccionar cliente"). */
  confirmShiftWithNewClient: (client: { name: string; phone: string; notes?: string }) => void;
  /** Se incrementa cada vez que se crea un turno, para que el Schedule vuelva a leer la BBDD. */
  appointmentsVersion: number;
  /** Tipo de bloqueo elegido en "Crear un nuevo bloqueo" (id de
      DetailsPanelOption — ver BLOCK_OPTIONS en AddShiftSidebar). Sólo
      'business-hour' tiene lógica real por ahora. */
  blockType: string | null;
  selectBlockType: (id: string) => void;
  /** Fila elegida en el Schedule (modo bloqueo), a la espera de confirmarse. */
  pendingBlockRow: BlockRow | null;
  selectBlockRow: (row: BlockRow) => void;
  /** Vuelve a la selección de fila sin cerrar el flujo (mantiene el tipo de bloqueo elegido). */
  cancelBlockRow: () => void;
  /** Confirma el bloqueo elegido: lo persiste y cierra el flujo. */
  confirmBlock: () => void;
  /** Se incrementa cada vez que se crea un bloqueo, para que el Schedule vuelva a leer la BBDD. */
  blocksVersion: number;
  /** Hora ("HH:mm") del turno recién creado: el Schedule hace scroll a esa
      fila al montarse, para no perder de vista el turno agregado. */
  scrollToTime: string | null;
  clearScrollToTime: () => void;
  /** Turno clickeado en el Schedule, a la espera de verse/editarse en la sidebar. */
  editingAppointment: Appointment | null;
  openEditAppointment: (appointment: Appointment) => void;
  closeEditAppointment: () => void;
  saveAppointment: (id: string, updated: Appointment) => void;
  cancelAppointment: (id: string) => void;
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
  const location = useLocation();
  const { teamFilters, selectedMembers, toggleTeamFilter, removeTeamFilter } = useTeamFilters(getTeamFilters);
  const [serviceFilters, setServiceFilters] = useState<DetailsPanelOption[]>(() =>
    getservices().map((service) => ({
      id: service.name.toLowerCase().replace(/\s+/g, '-'),
      label: service.name,
      checked: true,
      active: service.active !== false,
      colorClassName: SERVICE_COLOR_BY_ID[service.colorId ?? '']?.className,
    })),
  );

  const toggleServiceFilter = (id: string, checked: boolean) => {
    setServiceFilters((current) =>
      current.map((f) => (f.id === id ? { ...f, checked } : f)),
    );
  };

  const toggleServiceActive = (id: string, active: boolean) => {
    const target = getservices().find((s) => s.name.toLowerCase().replace(/\s+/g, '-') === id);
    if (!target) return;
    dbUpdateService(target.name, { ...target, active });
    setServiceFilters((current) => current.map((f) => (f.id === id ? { ...f, active } : f)));
  };
  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const openAddShift = () => setAddShiftOpen(true);
  const closeAddShift = () => {
    setAddShiftOpen(false);
    setShiftService(null);
    setShiftSlot(null);
    setBlockType(null);
    setPendingBlockRow(null);
  };
  const [shiftService, setShiftService] = useState<string | null>(null);
  const [shiftNoticeMessage, setShiftNoticeMessage] = useState<string | null>(null);
  /* Si el día que se está viendo ya no tiene ningún hueco para el servicio
     elegido, salta sola al próximo día que sí tenga (hasta 7 días
     adelante) — así no hay que ir probando día por día a mano. Si ninguno
     de esos 7 días tiene disponibilidad, avisa en vez de dejar al usuario
     mirando una grilla vacía sin explicación. */
  const selectShiftService = (serviceName: string) => {
    setShiftService(serviceName);

    const serviceInfo = getservices().find((item) => item.name === serviceName);
    const durationMinutes = serviceInfo ? parseServiceDurationMinutes(serviceInfo.duration) : 0;
    if (durationMinutes <= 0) return;

    const nextAvailable = getFirstAvailableDate(serviceName, durationMinutes, selectedDate, SHIFT_AVAILABILITY_SEARCH_DAYS);

    if (nextAvailable) {
      selectDate(nextAvailable);
    } else {
      setShiftNoticeMessage(`No hay turnos disponibles para "${serviceName}" en los próximos ${SHIFT_AVAILABILITY_SEARCH_DAYS} días.`);
    }
  };
  const [shiftSlot, setShiftSlot] = useState<ShiftSlot | null>(null);
  const selectShiftSlot = (slot: ShiftSlot) => setShiftSlot(slot);
  const cancelShiftSlot = () => setShiftSlot(null);
  const [appointmentsVersion, setAppointmentsVersion] = useState(0);
  const [scrollToTime, setScrollToTime] = useState<string | null>(null);
  const clearScrollToTime = () => setScrollToTime(null);

  /* "Crear un nuevo bloqueo": mismo patrón de a-dos-pasos que "Agregar
     turno" (elegir tipo → elegir fila en el Schedule → confirmar), pero
     sólo 'business-hour' hace algo (ver comentario de BlockRow más
     arriba) — los otros 3 tipos sólo resaltan la opción en la sidebar. */
  const [blockType, setBlockType] = useState<string | null>(null);
  const selectBlockType = (id: string) => setBlockType(id);
  const [pendingBlockRow, setPendingBlockRow] = useState<BlockRow | null>(null);
  const selectBlockRow = (row: BlockRow) => setPendingBlockRow(row);
  const cancelBlockRow = () => setPendingBlockRow(null);
  const [blocksVersion, setBlocksVersion] = useState(0);

  const confirmBlock = () => {
    if (!pendingBlockRow) return;

    addScheduleBlock({
      id: crypto.randomUUID(),
      date: pendingBlockRow.date,
      startTime: pendingBlockRow.startTime,
      endTime: pendingBlockRow.endTime,
    });

    setBlocksVersion((version) => version + 1);
    closeAddShift();
  };

  const confirmShiftClient = (clientName: string) => {
    if (!shiftSlot || !shiftService) return;

    addAppointment({
      id: crypto.randomUUID(),
      date: shiftSlot.date,
      startTime: shiftSlot.startTime,
      endTime: shiftSlot.endTime,
      member: shiftSlot.member,
      client: clientName,
      service: shiftService,
    });

    setAppointmentsVersion((version) => version + 1);
    setScrollToTime(shiftSlot.startTime);
    closeAddShift();
  };

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  /* Si se navega fuera de la agenda mientras el panel de edición de turno,
     o el flujo "Agregar turno", están abiertos, los cierra (si no,
     quedarían mostrándose en rutas donde no corresponde, como
     /admin/ajustes: el botón de Ajustes en AppMenubar navega directo sin
     pasar por closeAddShift, a diferencia de los demás accesos del menú).
     Va ANTES que el efecto de abajo (que puede volver a abrir "Agregar
     turno" vía location.state) para que, si ambos disparan en el mismo
     commit, ese efecto tenga la última palabra y el flujo quede abierto. */
  useEffect(() => {
    setEditingAppointment(null);
    setAddShiftOpen(false);
    setShiftService(null);
    setShiftSlot(null);
    setBlockType(null);
    setPendingBlockRow(null);
  }, [location.pathname]);

  useEffect(() => {
    const state = location.state as { openAddShift?: boolean } | null;
    if (state?.openAddShift) {
      setAddShiftOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const openEditAppointment = (appointment: Appointment) => setEditingAppointment(appointment);
  const closeEditAppointment = () => setEditingAppointment(null);

  const saveAppointment = (id: string, updated: Appointment) => {
    updateAppointment(id, updated);
    setAppointmentsVersion((version) => version + 1);
    setEditingAppointment(null);
  };

  const cancelAppointment = (id: string) => {
    removeAppointment(id);
    setAppointmentsVersion((version) => version + 1);
    setEditingAppointment(null);
  };
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
    if (shiftSlot && shiftService) {
      confirmShiftClient(client.name);
    }
    navigate('/admin');
  };

  /* A diferencia de createClient (alta desde la ruta /admin/cliente), esta
     no navega: se usa desde el buscador/alta del paso "Seleccionar cliente"
     del flujo "Agregar turno", que ya está en la propia agenda. */
  const confirmShiftWithNewClient = (client: { name: string; phone: string; notes?: string }) => {
    addClient({ ...client, appointmentsCount: 0, totalSpent: 0 });
    setClients(getClients());
    confirmShiftClient(client.name);
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
    toggleServiceActive,
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
    shiftService,
    selectShiftService,
    shiftSlot,
    selectShiftSlot,
    cancelShiftSlot,
    confirmShiftClient,
    confirmShiftWithNewClient,
    appointmentsVersion,
    blockType,
    selectBlockType,
    pendingBlockRow,
    selectBlockRow,
    cancelBlockRow,
    confirmBlock,
    blocksVersion,
    scrollToTime,
    clearScrollToTime,
    editingAppointment,
    openEditAppointment,
    closeEditAppointment,
    saveAppointment,
    cancelAppointment,
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

  const isSidebarlessPage =
    location.pathname.startsWith('/admin/ajustes') ||
    ['/admin/metricas', '/admin/marketing'].includes(location.pathname);

  return (
    <>
    <Layout
      menubar={<AppMenubar addShiftOpen={addShiftOpen} onCloseAddShift={closeAddShift} />}
      sidebar={
        addShiftOpen ? (
          <AddShiftSidebar
            serviceFilters={serviceFilters}
            clientFilters={clientFilters}
            onClose={closeAddShift}
            selectedService={shiftService}
            onSelectService={selectShiftService}
            shiftSlot={shiftSlot}
            onBack={cancelShiftSlot}
            onConfirmClient={confirmShiftClient}
            onAddClientAndConfirm={confirmShiftWithNewClient}
            blockType={blockType}
            onSelectBlockType={selectBlockType}
            pendingBlockRow={pendingBlockRow}
            onConfirmBlock={confirmBlock}
            onCancelBlockRow={cancelBlockRow}
          />
        ) : editingAppointment ? (
          <EditAppointmentSidebar
            appointment={editingAppointment}
            onClose={closeEditAppointment}
            onSave={saveAppointment}
            onCancelAppointment={cancelAppointment}
          />
        ) : isSidebarlessPage ? null : (
          <AdminSidebar
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            teamFilters={teamFilters}
            toggleTeamFilter={toggleTeamFilter}
            serviceFilters={serviceFilters}
            toggleServiceActive={toggleServiceActive}
            clientFilters={clientFilters}
          />
        )
      }
    >
      <Outlet context={context} />
    </Layout>
    <Toast message={shiftNoticeMessage} onDismiss={() => setShiftNoticeMessage(null)} />
    </>
  );
}

export function useAdminContext(): AdminContext {
  return useOutletContext<AdminContext>();
}

export default Dashboard;