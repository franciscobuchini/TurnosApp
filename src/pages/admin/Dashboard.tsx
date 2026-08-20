/*
  src/pages/admin/Dashboard.tsx
  Layout del panel de admin: arma el Layout con la Sidebar (paneles de
  calendario/equipo/servicios/clientes) y renderiza la vista activa según la
  ruta (react-router) mediante <Outlet>. Las vistas viven en
  src/components/views y tienen ruta propia.
*/

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type NavigateFunction,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom';
import { useAgendaDate } from '@/hooks/useAgendaDate';
import Layout from '../../components/layout/Layout';
import AppMenubar, { type SidebarPanel } from '../../components/layout/AppMenubar';
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
  confirmBookingRequest,
  rejectBookingRequest,

  getBookingRequests,
  getPendingBookingRequests,
  addScheduleBlock,
  removeScheduleBlock,
  getservices,
  removeClient,
  removeService,
  removeTeamMember,
  getTeamMembers,
  getOpeningHours,
  getScheduleBlocks,
  saveScheduleBlocks,
  DATA_CHANGE_EVENT,
} from '../../database/data';
import type { Appointment, Client, FiltersOption, ScheduleBlock, service, TeamMember, BookingRequest } from '../../database/types';
import { getBusinessHoursByDay, type TimeRange } from '@/hooks/useWeekSchedule';
import { useTeamFilters } from '@/hooks/useTeamFilters';
import { SERVICE_COLOR_BY_ID } from '../../components/widgets/serviceWidgets/serviceColors';
import { toggleBusinessDayBlockState } from '@/functions/blockToggleOperations';
import { isBusinessDayFullyBlocked, isBusinessDayAnyUnblocked } from '@/functions/scheduleCellAvailability';
import { toDateKey } from '@/utils/dateName';
import type { DetailsPanelOption } from '../../components/widgets/sidebarWidgets/DetailsPanel';
import AdminSidebar from '../../components/views/sidebarViews/AdminSidebar';
import EntitySidebarPanel from '../../components/views/sidebarViews/EntitySidebarPanel';
import AddShiftSidebar from '../../components/views/sidebarViews/AddShiftSidebar';
import EditAppointmentSidebar from '../../components/views/sidebarViews/EditAppointmentSidebar';
import EditBlockSidebar from '../../components/views/sidebarViews/EditBlockSidebar';
import Sidebar from '../../components/layout/Sidebar';
import Calendar from '../../components/widgets/sidebarWidgets/Calendar';
import Toast from '../../components/ui/toast';
import ConfirmDialog from '../../components/ui/confirm-dialog';
import OnboardingWizard from '../../components/widgets/onboarding/OnboardingWizard';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

import { DATE_RANGE_DAYS, getFirstAvailableDate, parseServiceDurationMinutes } from '@/functions/bookingAvailability';

/** Cuántos días adelante se busca disponibilidad al elegir servicio en
    "Agregar turno" antes de avisar que no hay turnos. */
const SHIFT_AVAILABILITY_SEARCH_DAYS = DATE_RANGE_DAYS;

/** Horario elegido en el Schedule para el turno en curso del flujo
    "Agregar turno", a la espera de que se elija el cliente. */
export interface ShiftSlot {
  member: string;
  date: string;
  startTime: string;
  endTime: string;
}

/** Franja horaria de un día para el bloqueo en curso del flujo "Crear un
    nuevo bloqueo" > "Bloquear hora del negocio" — mismo shape que
    ScheduleBlock (types.ts) sin id/member, que acá siempre es "todo el
    negocio". Sirve para dos cosas con la misma forma: una fila suelta tal
    cual se clickeó en el Schedule (15min, ver pendingBlockRows) y un rango
    ya fundido de varias filas contiguas (ver pendingBlockRanges). */
export interface BlockRow {
  date: string;
  startTime: string;
  endTime: string;
}

/** Miembro + día para el bloqueo en curso de "Bloquear día de un miembro"
    — a diferencia de BlockRow no lleva horario: siempre es el día completo
    de ese miembro, así que con el par alcanza. */
export interface MemberDayBlock {
  member: string;
  date: string;
}

/** Miembro + franja horaria para el bloqueo en curso de "Bloquear horario
    de un miembro" — mismo shape que BlockRow (fila suelta o rango ya
    fundido, ver pendingMemberHourCells/pendingMemberHourRanges) más
    `member`: a diferencia de BlockRow (todo el negocio) acá el horario es
    sólo de ESE miembro puntual, una celda en vez de una fila entera. */
export interface MemberHourBlock {
  member: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface AdminContext {
  teamFilters: FiltersOption[];
  selectedMembers: string[];
  toggleTeamFilter: (id: string, checked: boolean) => void;
  /** Cupo de columnas de miembro que entran en el ancho real del Schedule
      (lo mide y reporta Schedule.tsx) — ver el comentario de
      useTeamFilters.ts para el criterio completo. */
  setColumnCapacity: (count: number) => void;
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
  blockModeOpen: boolean;
  toggleBlockMode: () => void;
  saveBlockMode: () => void;
  cancelBlockMode: () => void;
  closeBlockMode: () => void;
  setShiftNoticeMessage: (message: string | null) => void;
  toggleBusinessDayBlock: (date: Date) => void;
  incrementBlocksVersion: () => void;
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
      DetailsPanelOption — ver BLOCK_OPTIONS en AddShiftSidebar). Los 4 ya
      tienen lógica real. */
  blockType: string | null;
  selectBlockType: (id: string) => void;
  /** Filas elegidas en el Schedule (modo 'business-hour', sueltas — cada
      click suma o saca una), a la espera de confirmarse. */
  pendingBlockRows: BlockRow[];
  toggleBlockRow: (row: BlockRow) => void;
  /** pendingBlockRows agrupadas por día y con las filas contiguas fundidas
      en un solo rango (clickear 3 filas seguidas da un rango de 45min, no
      3 de 15) — lo que se termina mostrando en la sidebar y persistiendo
      al confirmar. */
  pendingBlockRanges: BlockRow[];
  /** Miembros+día elegidos en el Schedule (modo 'member-day', sueltos —
      cada click en un header suma o saca uno), a la espera de confirmarse. */
  pendingMemberDays: MemberDayBlock[];
  toggleMemberDay: (entry: MemberDayBlock) => void;
  /** Fechas ("YYYY-MM-DD") elegidas en el Calendar de la sidebar para
      'business-day' (sueltas — cada click en un día suma o saca una), a
      la espera de confirmarse. */
  pendingBlockDays: string[];
  toggleBlockDay: (date: string) => void;
  /** Sale de 'business-day' (vuelve a la lista de opciones) descartando los
      días elegidos sin persistirlos. */
  exitBlockDayMode: () => void;
  /** Celdas elegidas en el Schedule (modo 'member-hour', sueltas — cada
      click suma o saca una), a la espera de confirmarse. */
  pendingMemberHourCells: MemberHourBlock[];
  toggleMemberHourCell: (cell: MemberHourBlock) => void;
  /** pendingMemberHourCells agrupadas por miembro+día y con las celdas
      contiguas fundidas en un solo rango — mismo criterio que
      pendingBlockRanges, pero por miembro además de por día. */
  pendingMemberHourRanges: MemberHourBlock[];
  /** Texto libre opcional del paso "Confirmar bloqueo" ("mantenimiento",
      "feriado", etc.) — uno solo para toda la tanda que se confirma junta,
      se guarda igual en cada ScheduleBlock que genere esa confirmación. */
  blockReason: string;
  setBlockReason: (reason: string) => void;
  /** Vacía toda la selección pendiente (de cualquiera de los cuatro modos) sin
      cerrar el flujo (mantiene el tipo de bloqueo elegido). */
  clearPendingBlocks: () => void;
  /** Confirma lo elegido (filas fundidas en rangos, miembros+día, fechas
      sueltas, y/o celdas de miembro fundidas en rangos): lo persiste y
      cierra el flujo. */
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
  /** Bloqueo clickeado en el Schedule (tarjeta "Horario bloqueado" ya
      confirmada), a la espera de verse/cancelarse en la sidebar — mismo
      patrón que editingAppointment. */
  editingBlock: ScheduleBlock | null;
  openEditBlock: (block: ScheduleBlock) => void;
  closeEditBlock: () => void;
  cancelBlock: (id: string) => void;
  createMember: (member: TeamMember) => void;
  updateMember: (previousName: string, member: TeamMember) => void;
  deleteMember: (name: string) => void;
  createService: (newService: service) => void;
  updateService: (previousName: string, updated: service) => void;
  deleteService: (name: string) => void;
  createClient: (client: Client) => void;
  updateClient: (previousName: string, updated: Client) => void;
  deleteClient: (name: string) => void;
  /** Abre el menú mobile (ver mobileMenuOpen en Dashboard.tsx) — lo usa el
      botón embebido en la fila de WeekSelector (ScheduleView), que
      "comparte espacio" con él en vez del botón flotante de AppMenubar. */
  openMobileMenu: () => void;
  /** Solicitudes de turno pendientes (desde /site) — en mobile, ScheduleView
      se las pasa a WeekSelector para mostrarlas debajo del Calendar del
      overlay a pantalla completa (mismo contenido que ya usa AdminSidebar
      en pc, ver NotificationsList). */
  bookingRequests: BookingRequest[];
  onConfirmBookingRequest: (request: BookingRequest) => void;
  onRejectBookingRequest: (request: BookingRequest) => void;
}

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamFilters, selectedMembers, toggleTeamFilter, removeTeamFilter, setColumnCapacity } = useTeamFilters(getTeamFilters);
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
  const { setDirty: setUnsavedDirty, confirmNavigation } = useUnsavedChanges();

  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const [blockModeOpen, setBlockModeOpen] = useState(false);
  /* Se pone en true ante cualquier click en modo Bloqueos/Desbloqueos
     (celda, fila, header de miembro o día del Calendar) — registrado en
     useUnsavedChanges para que salir a otro apartado (AppMenubar, que ya
     pasa todo por confirmNavigation) pida guardar o descartar en vez de
     perder el bloqueo en curso en silencio. */
  const [blockModeHasChanges, setBlockModeHasChanges] = useState(false);
  /* Sólo pc (ver sidebarPanel en AppMenubarProps): Equipo/Servicios/
     Clientes, disparados desde AppMenubar, reemplazan la sidebar entera
     por EntitySidebarPanel — mismo patrón que addShiftOpen/
     editingAppointment/editingBlock, así que se suma a la misma lista de
     resets que ellos (ver openAddShift/openBlockMode/openEditAppointment/
     openEditBlock y el efecto de location.pathname más abajo). */
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel | null>(null);
  const openSidebarPanel = (panel: SidebarPanel) => {
    setEditingAppointment(null);
    setEditingBlock(null);
    setBlockModeOpen(false);
    setAddShiftOpen(false);
    setSidebarPanel(panel);
  };
  const closeSidebarPanel = () => setSidebarPanel(null);
  /* En mobile (ver useLayoutTier) el botón que abre esto ya no vive sólo en
     AppMenubar: en la página del Schedule (ScheduleView), pasa a estar
     dentro de la fila de WeekSelector, para "compartir espacio" con él y
     con el avatar del empleado que se está mostrando — ver el comentario
     de MobileMenuButton en AppMenubar.tsx. Por eso el estado vive acá
     (Dashboard), no adentro de AppMenubar: los dos necesitan poder
     abrirlo/cerrarlo. */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openMobileMenu = () => setMobileMenuOpen(true);
  /* Solicitudes de turno pendientes (desde /site): en pc viven siempre
     abiertas debajo del Calendar de la sidebar por defecto (ver
     AdminSidebar.tsx); en mobile, debajo del Calendar del overlay de
     WeekSelector (ver ese componente) — ya no hay un botón "Notificaciones"
     propio en AppMenubar que las tape/destape, así que no hace falta un
     booleano de "abierto/cerrado": onConfirmBookingRequest/
     onRejectBookingRequest van directo por AdminContext a quien las
     necesite mostrar. */
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(() => getBookingRequests());
  /* Wizard de bienvenida (OnboardingWizard): sólo se abre vía location.state
     al llegar desde "Crear cuenta" en Home.tsx (ver el useEffect de
     location.state más abajo). */
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  /* "Crear turno" no navega a otra ruta (abre un panel dentro de la misma
     /admin), pero igual puede tapar una vista con cambios sin guardar
     (modo Bloqueos/Desbloqueos) — pasa por confirmNavigation por la misma
     razón que los ítems de AppMenubar. */
  const openAddShift = () => {
    confirmNavigation(() => {
      setEditingAppointment(null);
      setEditingBlock(null);
      setBlockModeOpen(false);
      setSidebarPanel(null);
      setAddShiftOpen(true);
    });
  };
  const closeAddShift = () => {
    setAddShiftOpen(false);
    setShiftService(null);
    setShiftSlot(null);
    setBlockType(null);
    setPendingBlockRows([]);
    setPendingMemberDays([]);
    setPendingBlockDays([]);
    setPendingMemberHourCells([]);
    setBlockReason('');
  };

  const [blockModeSnapshot, setBlockModeSnapshot] = useState<ScheduleBlock[] | null>(null);

  /* Entrar a modo Bloqueos/Desbloqueos pide el PIN de administrador (mismo
     criterio que "Editar web" en AppMenubar y "Desactivar" en AdminSidebar
     — una acción sensible, cambia la disponibilidad de turnos del
     negocio). Salir (guardar) no lo vuelve a pedir: ya se confirmó al
     entrar. */
  const [blockModePinOpen, setBlockModePinOpen] = useState(false);

  const openBlockMode = () => {
    closeAddShift();
    setEditingAppointment(null);
    setEditingBlock(null);
    setSidebarPanel(null);
    setBlockModeSnapshot(getScheduleBlocks());
    setBlockModeHasChanges(false);
    setBlockModeOpen(true);
  };

  const toggleBlockMode = () => {
    if (!blockModeOpen) {
      setBlockModePinOpen(true);
    } else {
      saveBlockMode();
    }
  };


  const saveBlockMode = () => {
    setBlockModeSnapshot(null);
    setBlockModeHasChanges(false);
    setBlockModeOpen(false);
    setBlocksVersion((v) => v + 1);
  };

  const cancelBlockMode = () => {
    if (blockModeSnapshot !== null) {
      saveScheduleBlocks(blockModeSnapshot);
      setBlockModeSnapshot(null);
      setBlocksVersion((v) => v + 1);
    }
    setBlockModeHasChanges(false);
    setBlockModeOpen(false);
  };

  const closeBlockMode = () => {
    cancelBlockMode();
  };

  /* Registra el borrador del modo Bloqueos/Desbloqueos en la guarda global
     de useUnsavedChanges: al navegar a otro apartado (AppMenubar, que ya
     pasa todo por confirmNavigation) con clicks sin confirmar, pide
     "Guardar y salir" o "Salir sin guardar". cancelBlockMode va como
     onDiscard (no alcanza con el efecto de location.pathname de más abajo:
     ese sólo corre mientras Dashboard sigue montado, y no lo sigue al
     navegar a una ruta top-level como "/personalizacion", fuera de
     <Dashboard>). */
  useEffect(() => {
    setUnsavedDirty(blockModeOpen && blockModeHasChanges, saveBlockMode, cancelBlockMode);
  }, [blockModeOpen, blockModeHasChanges, setUnsavedDirty, saveBlockMode, cancelBlockMode]);

  const toggleBusinessDayBlock = (date: Date) => {
    const hoursByDay = getBusinessHoursByDay(getOpeningHours());
    const isDayOff =
      ((hoursByDay[date.getDay()] ?? []).length === 0 || isBusinessDayFullyBlocked(date)) &&
      !isBusinessDayAnyUnblocked(date);
    const dateStr = toDateKey(date);
    const result = toggleBusinessDayBlockState({
      dateStr,
      isBusinessDayOpen: !isDayOff,
    });
    if (!result.success && result.message) {
      setShiftNoticeMessage(result.message);
    } else {
      incrementBlocksVersion();
    }
  };

  const incrementBlocksVersion = () => {
    setBlocksVersion((v) => v + 1);
    if (blockModeOpen) setBlockModeHasChanges(true);
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
     turno" (elegir tipo → elegir dónde → confirmar). Los 4 tipos ya
     hacen algo (ver comentarios de BlockRow/MemberDayBlock/
     pendingBlockDays/MemberHourBlock):
     - 'business-hour' y 'member-hour' se eligen clickeando en el Schedule
       (fila entera, o una sola celda de un miembro — mismo mecanismo,
       distinto alcance).
     - 'member-day' se elige clickeando el header de un miembro (columna
       entera).
     - 'business-day' se elige clickeando días en un Calendar dentro de la
       propia sidebar (ver AddShiftSidebar.tsx), por eso es el único que
       no tiene blockMode ni pasa por Schedule.tsx.
     A diferencia de shiftSlot (una sola celda), acá se van sumando (o
     sacando, si se clickea uno ya elegido) varios sueltos en la misma
     sesión — por eso son arrays, no un solo valor. Arrays separados por
     tipo (no uno mezclado) porque son unidades distintas: una fila de
     15min con horario propio, un miembro+día sin horario, sólo una fecha
     (siempre el negocio entero, el día completo), o una celda de 15min
     con horario Y miembro propios — pero comparten el mismo botón
     "Confirmar bloqueo" al final (ver confirmBlock). */
  const [blockType, setBlockType] = useState<string | null>(null);
  const selectBlockType = (id: string) => setBlockType(id);
  const [pendingBlockRows, setPendingBlockRows] = useState<BlockRow[]>([]);

  const toggleBlockRow = (row: BlockRow) => {
    setPendingBlockRows((current) => {
      const isSelected = current.some((r) => r.date === row.date && r.startTime === row.startTime);
      return isSelected
        ? current.filter((r) => !(r.date === row.date && r.startTime === row.startTime))
        : [...current, row];
    });
  };

  const [pendingMemberDays, setPendingMemberDays] = useState<MemberDayBlock[]>([]);

  const toggleMemberDay = (entry: MemberDayBlock) => {
    setPendingMemberDays((current) => {
      const isSelected = current.some((e) => e.member === entry.member && e.date === entry.date);
      return isSelected
        ? current.filter((e) => !(e.member === entry.member && e.date === entry.date))
        : [...current, entry];
    });
  };

  const [pendingMemberHourCells, setPendingMemberHourCells] = useState<MemberHourBlock[]>([]);

  const toggleMemberHourCell = (cell: MemberHourBlock) => {
    setPendingMemberHourCells((current) => {
      const isSelected = current.some(
        (c) => c.member === cell.member && c.date === cell.date && c.startTime === cell.startTime,
      );
      return isSelected
        ? current.filter((c) => !(c.member === cell.member && c.date === cell.date && c.startTime === cell.startTime))
        : [...current, cell];
    });
  };

  /** Fechas ("YYYY-MM-DD") elegidas en el Calendar de la sidebar para
      'business-day' — a diferencia de BlockRow/MemberDayBlock alcanza con
      el string solo, no hace falta un objeto (siempre es el negocio
      entero, el día completo). */
  const [pendingBlockDays, setPendingBlockDays] = useState<string[]>([]);

  const toggleBlockDay = (date: string) => {
    setPendingBlockDays((current) =>
      current.includes(date) ? current.filter((d) => d !== date) : [...current, date],
    );
  };

  /** 'business-day' reemplaza la lista de opciones por el Calendar (ver
      AddShiftSidebar.tsx) — sin la lista visible no hay otra forma de
      cambiar de tipo o salir, así que "Volver" desde ahí pasa por acá:
      descarta los días elegidos sin persistirlos y vuelve a mostrar la
      lista de opciones. */
  const exitBlockDayMode = () => {
    setBlockType(null);
    setPendingBlockDays([]);
    setBlockReason('');
  };

  const clearPendingBlocks = () => {
    setBlockType(null);
    setPendingBlockRows([]);
    setPendingMemberDays([]);
    setPendingBlockDays([]);
    setPendingMemberHourCells([]);
    setBlockReason('');
  };

  /** Motivo del bloqueo, cargado en el paso "Confirmar bloqueo" — uno solo
      para toda la tanda que se confirma junta (ver confirmBlock). */
  const [blockReason, setBlockReason] = useState('');

  const [blocksVersion, setBlocksVersion] = useState(0);

  /* Funde las filas sueltas elegidas en rangos por día: ordena por hora
     dentro de cada día y pega las que son contiguas (el fin de una
     coincide con el inicio de la siguiente) en un solo tramo — así elegir
     3 filas seguidas termina en UN bloqueo de 45min en vez de 3 de 15, y
     elegir filas salteadas (o de días distintos) da varios rangos, uno por
     cada tramo contiguo. Se usa tanto para el resumen que ve el usuario en
     la sidebar como para lo que se persiste al confirmar — mismo cálculo,
     una sola vez. */
  const pendingBlockRanges = useMemo(() => {
    const rowsByDate = new Map<string, BlockRow[]>();
    for (const row of pendingBlockRows) {
      const rowsForDate = rowsByDate.get(row.date) ?? [];
      rowsForDate.push(row);
      rowsByDate.set(row.date, rowsForDate);
    }

    const ranges: BlockRow[] = [];
    for (const [date, rows] of rowsByDate) {
      const sorted = [...rows].sort((a, b) => a.startTime.localeCompare(b.startTime));
      let rangeStart = sorted[0].startTime;
      let rangeEnd = sorted[0].endTime;

      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].startTime === rangeEnd) {
          rangeEnd = sorted[i].endTime;
        } else {
          ranges.push({ date, startTime: rangeStart, endTime: rangeEnd });
          rangeStart = sorted[i].startTime;
          rangeEnd = sorted[i].endTime;
        }
      }
      ranges.push({ date, startTime: rangeStart, endTime: rangeEnd });
    }

    return ranges.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [pendingBlockRows]);

  /* Misma fusión que pendingBlockRanges, pero agrupando por miembro+día en
     vez de sólo por día (una celda de 15min lleva horario Y miembro
     propios) — clickear 3 celdas seguidas del mismo miembro da un rango de
     45min para ESE miembro, no se funde con las de otro miembro aunque
     compartan horario. */
  const pendingMemberHourRanges = useMemo(() => {
    const cellsByMemberDate = new Map<string, MemberHourBlock[]>();
    for (const cell of pendingMemberHourCells) {
      const key = `${cell.member} ${cell.date}`;
      const cellsForKey = cellsByMemberDate.get(key) ?? [];
      cellsForKey.push(cell);
      cellsByMemberDate.set(key, cellsForKey);
    }

    const ranges: MemberHourBlock[] = [];
    for (const cells of cellsByMemberDate.values()) {
      const sorted = [...cells].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const { member, date } = sorted[0];
      let rangeStart = sorted[0].startTime;
      let rangeEnd = sorted[0].endTime;

      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].startTime === rangeEnd) {
          rangeEnd = sorted[i].endTime;
        } else {
          ranges.push({ member, date, startTime: rangeStart, endTime: rangeEnd });
          rangeStart = sorted[i].startTime;
          rangeEnd = sorted[i].endTime;
        }
      }
      ranges.push({ member, date, startTime: rangeStart, endTime: rangeEnd });
    }

    return ranges.sort(
      (a, b) => a.date.localeCompare(b.date) || a.member.localeCompare(b.member) || a.startTime.localeCompare(b.startTime),
    );
  }, [pendingMemberHourCells]);

  const confirmBlock = () => {
    if (
      pendingBlockRanges.length === 0 &&
      pendingMemberDays.length === 0 &&
      pendingBlockDays.length === 0 &&
      pendingMemberHourRanges.length === 0
    ) {
      return;
    }

    const reason = blockReason.trim() || undefined;
    const isUnblock = Boolean(blockType && blockType.startsWith('unblock-'));
    const type: 'block' | 'unblock' = isUnblock ? 'unblock' : 'block';

    for (const range of pendingBlockRanges) {
      addScheduleBlock({
        id: crypto.randomUUID(),
        date: range.date,
        startTime: range.startTime,
        endTime: range.endTime,
        type,
        reason,
      });
    }

    for (const entry of pendingMemberDays) {
      if (isUnblock) {
        // Desbloquear dentro del horario hábil de trabajo de ese día
        const d = new Date(`${entry.date}T00:00:00`);
        const dayOfWeek = d.getDay();
        const memberObj = getTeamMembers().find((m) => m.name === entry.member);
        const memberSchedule = Array.isArray(memberObj?.schedule) ? memberObj.schedule : undefined;
        const memberRanges = memberSchedule ? getBusinessHoursByDay(memberSchedule)[dayOfWeek] : [];
        const businessRanges = getBusinessHoursByDay(getOpeningHours())[dayOfWeek] ?? [];

        let targetRanges: TimeRange[] = [];
        if (memberRanges && memberRanges.length > 0) {
          targetRanges = memberRanges;
        } else if (businessRanges && businessRanges.length > 0) {
          targetRanges = businessRanges;
        } else {
          const allBusinessDays = Object.values(getBusinessHoursByDay(getOpeningHours()));
          const firstOpenDay = allBusinessDays.find((r) => r && r.length > 0);
          targetRanges = firstOpenDay?.length ? firstOpenDay : [{ startTime: '09:00', endTime: '18:00' }];
        }

        for (const range of targetRanges) {
          addScheduleBlock({
            id: crypto.randomUUID(),
            date: entry.date,
            startTime: range.startTime,
            endTime: range.endTime,
            member: entry.member,
            type: 'unblock',
            reason,
          });
        }
      } else {
        // Bloquear día completo del miembro
        addScheduleBlock({
          id: crypto.randomUUID(),
          date: entry.date,
          startTime: '00:00',
          endTime: '24:00',
          member: entry.member,
          type: 'block',
          reason,
        });
      }
    }

    for (const date of pendingBlockDays) {
      if (isUnblock) {
        const d = new Date(`${date}T00:00:00`);
        const dayOfWeek = d.getDay();
        const businessRanges = getBusinessHoursByDay(getOpeningHours())[dayOfWeek] ?? [];

        let targetRanges: TimeRange[] = [];
        if (businessRanges && businessRanges.length > 0) {
          targetRanges = businessRanges;
        } else {
          const allBusinessDays = Object.values(getBusinessHoursByDay(getOpeningHours()));
          const firstOpenDay = allBusinessDays.find((r) => r && r.length > 0);
          targetRanges = firstOpenDay?.length ? firstOpenDay : [{ startTime: '09:00', endTime: '18:00' }];
        }

        for (const range of targetRanges) {
          addScheduleBlock({
            id: crypto.randomUUID(),
            date,
            startTime: range.startTime,
            endTime: range.endTime,
            type: 'unblock',
            reason,
          });
        }
      } else {
        // Bloquear día completo del negocio
        addScheduleBlock({
          id: crypto.randomUUID(),
          date,
          startTime: '00:00',
          endTime: '24:00',
          type: 'block',
          reason,
        });
      }
    }

    for (const range of pendingMemberHourRanges) {
      addScheduleBlock({
        id: crypto.randomUUID(),
        date: range.date,
        startTime: range.startTime,
        endTime: range.endTime,
        member: range.member,
        type,
        reason,
      });
    }

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
    if (blockModeSnapshot !== null) {
      saveScheduleBlocks(blockModeSnapshot);
      setBlockModeSnapshot(null);
      setBlocksVersion((v) => v + 1);
    }
    setEditingAppointment(null);
    setEditingBlock(null);
    setAddShiftOpen(false);
    setBlockModeOpen(false);
    setBlockModeHasChanges(false);
    setSidebarPanel(null);
    setMobileMenuOpen(false);
    setShiftService(null);
    setShiftSlot(null);
    setBlockType(null);
    setPendingBlockRows([]);
    setPendingMemberDays([]);
    setPendingBlockDays([]);
    setPendingMemberHourCells([]);
    setBlockReason('');
  }, [location.pathname]);

  useEffect(() => {
    const state = location.state as {
      openAddShift?: boolean;
      openSidebarPanel?: SidebarPanel;
      onboarding?: boolean;
    } | null;
    if (state?.openAddShift) {
      setAddShiftOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
    if (state?.openSidebarPanel) {
      openSidebarPanel(state.openSidebarPanel);
      navigate(location.pathname, { replace: true, state: null });
    }
    if (state?.onboarding) {
      setOnboardingOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const openEditAppointment = (appointment: Appointment) => {
    setEditingBlock(null);
    setSidebarPanel(null);
    setEditingAppointment(appointment);
  };
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

  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const openEditBlock = (block: ScheduleBlock) => {
    setEditingAppointment(null);
    setSidebarPanel(null);
    setEditingBlock(block);
  };
  const closeEditBlock = () => setEditingBlock(null);

  const cancelBlock = (id: string) => {
    removeScheduleBlock(id);
    setBlocksVersion((version) => version + 1);
    setEditingBlock(null);
  };
  const { viewDate, selectedDate, setViewDate, setSelectedDate, selectDate } = useAgendaDate();
  const [clients, setClients] = useState<Client[]>(() => getClients());
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const previousPendingIdsRef = useRef<Set<string>>(
    new Set(getPendingBookingRequests().map((r) => r.id)),
  );

  /* Sincronización en tiempo real: ante cualquier alta/baja/modificación
     de turnos, clientes, bloqueos o solicitudes de turnos (desde la web del cliente o desde el panel),
     se actualizan las versiones para que Schedule y los filtros se refresquen al instante. */
  useEffect(() => {
    const handleDataChange = () => {
      setAppointmentsVersion((version) => version + 1);
      setBlocksVersion((version) => version + 1);
      setClients(getClients());
      setBookingRequests(getBookingRequests());

      // Detectar nuevas solicitudes de turno entrantes para notificar al admin
      const currentPending = getPendingBookingRequests();
      const currentIds = new Set(currentPending.map((r) => r.id));
      const newlyAdded = currentPending.filter((r) => !previousPendingIdsRef.current.has(r.id));

      if (newlyAdded.length > 0) {
        const latest = newlyAdded[0];
        setShiftNoticeMessage(`🔔 Nueva solicitud de turno: ${latest.client.name} (${latest.service})`);
      }

      previousPendingIdsRef.current = currentIds;
    };


    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, []);

  const handleConfirmBookingRequest = (request: BookingRequest) => {
    const result = confirmBookingRequest(request.id);
    if (result) {
      setAppointmentsVersion((version) => version + 1);
      setClients(getClients());

      const [yyyy, mm, dd] = request.date.split('-').map(Number);
      if (yyyy && mm && dd) {
        selectDate(new Date(yyyy, mm - 1, dd));
      }
      setScrollToTime(request.startTime);

      if (location.pathname !== '/admin') {
        navigate('/admin');
      }

      setShiftNoticeMessage(`Turno de ${request.client.name} confirmado y agregado a la agenda`);
    }
  };

  const handleRejectBookingRequest = (request: BookingRequest) => {
    rejectBookingRequest(request.id);
    setShiftNoticeMessage(`Solicitud de ${request.client.name} rechazada`);
  };


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
        phone: client.phone,
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

  /* Mismo alta rápida que confirmShiftWithNewClient, sin el paso de
     confirmar turno: la usa el buscador del panel Clientes de AdminSidebar,
     que no tiene ningún turno en curso. */
  const addClientInline = (client: { name: string; phone: string; notes?: string }) => {
    addClient({ ...client, appointmentsCount: 0, totalSpent: 0 });
    setClients(getClients());
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
    setColumnCapacity,
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
    blockModeOpen,
    toggleBlockMode,
    saveBlockMode,
    cancelBlockMode,
    closeBlockMode,
    setShiftNoticeMessage,
    toggleBusinessDayBlock,
    incrementBlocksVersion,
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
    pendingBlockRows,
    toggleBlockRow,
    pendingBlockRanges,
    pendingMemberDays,
    toggleMemberDay,
    pendingBlockDays,
    toggleBlockDay,
    exitBlockDayMode,
    pendingMemberHourCells,
    toggleMemberHourCell,
    pendingMemberHourRanges,
    blockReason,
    setBlockReason,
    clearPendingBlocks,
    confirmBlock,
    blocksVersion,
    scrollToTime,
    clearScrollToTime,
    editingAppointment,
    openEditAppointment,
    closeEditAppointment,
    saveAppointment,
    cancelAppointment,
    editingBlock,
    openEditBlock,
    closeEditBlock,
    cancelBlock,
    createMember,
    updateMember,
    deleteMember,
    createService,
    updateService,
    deleteService,
    createClient,
    updateClient,
    deleteClient,
    openMobileMenu,
    bookingRequests,
    onConfirmBookingRequest: handleConfirmBookingRequest,
    onRejectBookingRequest: handleRejectBookingRequest,
  };

  /* Las vistas de "Detalles de..."/"Perfil de..."/"Acerca de..." y "Crear un
     nuevo..." (miembro/servicio/cliente) ya son, ellas mismas, una columna
     centrada de ViewLayout — mostrar la sidebar de Equipo/Servicios/
     Clientes al lado es redundante (esa misma lista es, de hecho, por
     dónde se llega a la fila que abrió esta vista) y le resta ancho al
     formulario. */
  const isSidebarlessPage =
    location.pathname.startsWith('/admin/ajustes') ||
    location.pathname.startsWith('/admin/miembro') ||
    location.pathname.startsWith('/admin/servicio') ||
    location.pathname.startsWith('/admin/cliente') ||
    ['/admin/metricas', '/admin/marketing'].includes(location.pathname);

  /* Ramas que se embeben en los dos lugares (Layout y AppMenubar, ver
     sidebarContent/mobileMenuSidebarContent más abajo) — computadas una
     sola vez para no duplicar el JSX. */
  const addShiftSidebarContent = (
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
      pendingBlockRows={pendingBlockRows}
      pendingBlockRanges={pendingBlockRanges}
      pendingMemberDays={pendingMemberDays}
      pendingBlockDays={pendingBlockDays}
      onToggleBlockDay={toggleBlockDay}
      onExitBlockDayMode={exitBlockDayMode}
      pendingMemberHourRanges={pendingMemberHourRanges}
      blockReason={blockReason}
      onBlockReasonChange={setBlockReason}
      onConfirmBlock={confirmBlock}
      onClearPendingBlocks={clearPendingBlocks}
    />
  );
  const editAppointmentSidebarContent = editingAppointment ? (
    <EditAppointmentSidebar
      appointment={editingAppointment}
      onClose={closeEditAppointment}
      onSave={saveAppointment}
      onCancelAppointment={cancelAppointment}
    />
  ) : null;
  const editBlockSidebarContent = editingBlock ? (
    <EditBlockSidebar block={editingBlock} onClose={closeEditBlock} onCancelBlock={cancelBlock} />
  ) : null;
  /* Sólo pc: Equipo/Servicios/Clientes disparados desde AppMenubar (ver
     sidebarPanel más arriba) — mismo mecanismo que el resto de las ramas de
     acá abajo, reemplaza toda la sidebar. key={sidebarPanel} para que el
     estado interno del panel (ej. el buscador de Clientes) arranque limpio
     al pasar de un panel a otro sin volver al default primero. */
  const entitySidebarPanelContent = sidebarPanel ? (
    <EntitySidebarPanel
      key={sidebarPanel}
      panel={sidebarPanel}
      onClose={closeSidebarPanel}
      teamFilters={teamFilters}
      toggleTeamFilter={toggleTeamFilter}
      serviceFilters={serviceFilters}
      toggleServiceActive={toggleServiceActive}
      clientFilters={clientFilters}
      onAddClient={addClientInline}
    />
  ) : null;

  /* Se le pasa esto mismo tanto a <Layout sidebar> (pc: al lado de
     Schedule) como a <AppMenubar sidebar> (mobile: dentro de su propio
     menú a pantalla completa — ver los comentarios de Layout.tsx y
     AppMenubar.tsx) — un solo lugar decide qué sidebar corresponde
     mostrar según el estado, cada uno decide nada más DÓNDE mostrarla. */
  const sidebarContent = addShiftOpen ? (
    addShiftSidebarContent
  ) : editingAppointment ? (
    editAppointmentSidebarContent
  ) : editingBlock ? (
    editBlockSidebarContent
  ) : sidebarPanel ? (
    entitySidebarPanelContent
  ) : isSidebarlessPage ? null : blockModeOpen ? (
    <Sidebar>
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={selectDate}
        blockModeOpen
        onToggleBusinessDayBlock={toggleBusinessDayBlock}
      />
    </Sidebar>
  ) : (
    <AdminSidebar
      selectedDate={selectedDate}
      onSelectDate={selectDate}
      bookingRequests={bookingRequests}
      onConfirmBookingRequest={handleConfirmBookingRequest}
      onRejectBookingRequest={handleRejectBookingRequest}
    />
  );

  /* Lo mismo que sidebarContent, pero SIN el Calendar de bloqueos, el
     AdminSidebar por defecto (Calendar + Notificaciones) ni
     entitySidebarPanelContent (sidebarPanel es un concepto sólo de pc: en
     mobile, Equipo/Servicios/Clientes tienen sus propios overlays acá
     abajo, sin pasar por Dashboard.tsx). Notificaciones tampoco: en mobile
     vive embebida debajo del Calendar del overlay de WeekSelector (ver ese
     componente), no acá — ya no hay un botón "Notificaciones" propio en
     AppMenubar que dispare nada por acá. Agregar turno/editar turno/bloqueo
     sí se siguen embebiendo — sin esto, mobile se quedaría sin forma de
     llegar a esos pasos. */
  const mobileMenuSidebarContent = addShiftOpen
    ? addShiftSidebarContent
    : editingAppointment
      ? editAppointmentSidebarContent
      : editingBlock
        ? editBlockSidebarContent
        : null;

  return (
    <>
      <Layout
        menubar={
          <AppMenubar
            addShiftOpen={addShiftOpen}
            onCloseAddShift={closeAddShift}
            sidebarPanel={sidebarPanel}
            onCloseSidebarPanel={closeSidebarPanel}
            sidebar={mobileMenuSidebarContent}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            teamFilters={teamFilters}
            toggleTeamFilter={toggleTeamFilter}
            serviceFilters={serviceFilters}
            toggleServiceActive={toggleServiceActive}
            clientFilters={clientFilters}
          />
        }
        sidebar={sidebarContent}
      >
        <Outlet context={context} />
      </Layout>
      <Toast message={shiftNoticeMessage} onDismiss={() => setShiftNoticeMessage(null)} />
      <OnboardingWizard open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
      <ConfirmDialog
        open={blockModePinOpen}
        onOpenChange={setBlockModePinOpen}
        title="¿Bloquear o desbloquear horarios?"
        description="Vas a cambiar la disponibilidad de turnos del negocio."
        confirmText="Continuar"
        onConfirm={openBlockMode}
        requirePin
      />
    </>
  );
}

export function useAdminContext(): AdminContext {
  return useOutletContext<AdminContext>();
}

export default Dashboard;