import { useState, type ReactNode } from 'react';
import type { Appointment, BookingRequest, ScheduleBlock } from '../../database/types';
import type { FiltersOption } from '../../database/types';
import type { ShiftSlot } from '../../pages/admin/Dashboard';
import { getTeamMembers } from '../../database/data';
import { useLayoutTier } from '@/hooks/useLayoutTier';
import ContentHeader from '../ui/content-header';
import Image from '../ui/image';
import MobileMenuButton from '../buttons/MobileMenuButton';
import MainContent from '../layout/MainContent';
import MobileOverlay from '../layout/MobileOverlay';
import WeekSelector from '../widgets/mainWidgets/WeekSelector';
import Schedule from '../widgets/mainWidgets/Schedule';
import { DetailsPanelOptionRow } from '../widgets/sidebarWidgets/DetailsPanel';

const SCHEDULE_VIEW_CLASS = 'flex h-full w-full flex-col sm:gap-3 sm:p-3 gap-2 px-0 pt-3 pb-0';

/* Mobile (ver useLayoutTier): WeekSelector ya no va solo — "comparte
   espacio" con el botón que abre el menú mobile (a la izquierda) y con
   el avatar del empleado que se está mostrando en el Schedule (a la
   derecha, reemplaza al header de la tabla que antes lo mostraba arriba
   de la columna — ver showHeader en Schedule.tsx). selectedMembers[0] es
   el mismo miembro que termina en la única columna visible: Schedule.tsx
   recorta a `members.slice(0, visibleColumnCount)` sin reordenar, y en
   mobile ese cupo ya da 1 sola columna. px-2: SCHEDULE_VIEW_CLASS es
   px-0 en mobile (le da todo el ancho a la grilla del Schedule), pero
   esta fila sí necesita separación del borde — si no, el botón del menú
   y el avatar quedan pegados a los bordes de la pantalla. */
const SCHEDULE_MOBILE_TOP_ROW_CLASS = 'flex items-center gap-2 px-2';

const SCHEDULE_MOBILE_AVATAR_CLASS = 'size-12 shrink-0 text-sm';

/* Tocar el avatar abre un picker de equipo a pantalla completa (mismo
   MobileOverlay que el menú y que el Calendar de WeekSelector) — elegir
   un miembro ahí lo deja como el único tildado (en mobile sólo entra 1
   columna, ver SCHEDULE_MOBILE_AVATAR_CLASS más arriba) y cierra el
   overlay: como ya está en /admin, "llevar a Schedule" es simplemente
   volver a ver la grilla, ahora con ese miembro. */
const SCHEDULE_MOBILE_MEMBER_LIST_CLASS = 'flex flex-col gap-1';

interface ScheduleViewProps {
  selectedMembers: string[];
  viewDate: Date;
  selectedDate: Date;
  onViewDateChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  selectedClientName?: string;
  blockedMembers?: string[];
  /** Servicio elegido en el flujo "Agregar turno": las celdas disponibles
      muestran, al hacer hover, una vista previa del tamaño del turno según
      la duración de este servicio. */
  previewService?: string | null;
  /** Horario ya elegido en el flujo "Agregar turno", a la espera de que se
      confirme el cliente: se muestra fijo (sin hover) en su celda. */
  pendingSlot?: ShiftSlot | null;
  /** Se dispara al hacer click en una celda disponible con servicio elegido. */
  onSlotClick?: (slot: ShiftSlot) => void;
  /** Se dispara al hacer click en la tarjeta de un turno ya confirmado. */
  onAppointmentClick?: (appointment: Appointment) => void;
  /** Fuerza a Schedule a releer los turnos de la BBDD tras crear uno nuevo. */
  appointmentsVersion?: number;
  /** Hora ("HH:mm") del turno recién creado: al montar, hace scroll a esa fila. */
  scrollToTime?: string | null;
  onScrollConsumed?: () => void;
  /** Abre el flujo "Agregar turno" desde el botón flotante del Schedule. */
  onOpenAddShift?: () => void;
  /** Flujo "Agregar turno" abierto: el botón flotante del Schedule pasa a
      ser una "X" que lo cierra. */
  addShiftOpen?: boolean;
  onCloseAddShift?: () => void;
  /** Modo unificado de Bloqueos / Desbloqueos */
  blockModeOpen?: boolean;
  onToggleBlockMode?: () => void;
  onSaveBlockMode?: () => void;
  onCancelBlockMode?: () => void;
  onNoticeMessage?: (message: string) => void;
  onBlocksVersionChange?: () => void;
  /** Filtros del equipo: para el dropdown de acciones del header de cada
      miembro (ocultar/mostrar + ver perfil). */
  teamFilters?: FiltersOption[];
  toggleTeamFilter?: (id: string, checked: boolean) => void;
  onMemberDetails?: (name: string) => void;
  /** Se dispara al hacer click en una tarjeta "Horario bloqueado" ya confirmada. */
  onBlockClick?: (block: ScheduleBlock) => void;
  blocksVersion?: number;
  /** Cupo de columnas de miembro que entran en el ancho real del Schedule —
      lo mide y reporta Schedule.tsx, ver useTeamFilters.ts. */
  onColumnCapacityChange?: (count: number) => void;
  /** Abre el menú mobile (ver openMobileMenu en Dashboard.tsx) — sólo se
      usa en mobile, desde el botón embebido en la fila de WeekSelector. */
  onOpenMobileMenu?: () => void;
  /** Solicitudes de turno pendientes (desde /site): en mobile, WeekSelector
      las muestra debajo del Calendar de su overlay a pantalla completa
      (ver ese componente) — sólo aplica ahí, se ignoran en pc. */
  bookingRequests?: BookingRequest[];
  onConfirmBookingRequest?: (request: BookingRequest) => void;
  onRejectBookingRequest?: (request: BookingRequest) => void;
  children?: ReactNode;
}

export default function ScheduleView({
  selectedMembers,
  viewDate,
  selectedDate,
  onViewDateChange,
  onSelectDate,
  blockedMembers,
  previewService,
  pendingSlot,
  onSlotClick,
  onAppointmentClick,
  appointmentsVersion,
  scrollToTime,
  onScrollConsumed,
  onOpenAddShift,
  addShiftOpen,
  onCloseAddShift,
  blockModeOpen,
  onToggleBlockMode,
  onSaveBlockMode,
  onCancelBlockMode,
  onNoticeMessage,
  onBlocksVersionChange,
  teamFilters,
  toggleTeamFilter,
  onMemberDetails,
  onBlockClick,
  blocksVersion,
  onColumnCapacityChange,
  onOpenMobileMenu,
  bookingRequests,
  onConfirmBookingRequest,
  onRejectBookingRequest,
  children,
}: ScheduleViewProps) {
  const tier = useLayoutTier();
  const visibleMemberPhoto = getTeamMembers().find((m) => m.name === selectedMembers[0])?.photo;

  const [memberOverlayOpen, setMemberOverlayOpen] = useState(false);
  const currentMemberId = teamFilters?.find((filter) => filter.label === selectedMembers[0])?.id;

  /* En mobile "elegir un miembro" reemplaza la selección entera (no suma
     al grupo tildado): tilda ÚNICAMENTE el elegido y destilda el resto,
     así el nuevo miembro es siempre el que termina en la única columna
     visible (selectedMembers[0] — ver Schedule.tsx). */
  const selectOnlyMember = (chosenId: string) => {
    teamFilters?.forEach((filter) => {
      const shouldBeChecked = filter.id === chosenId;
      if (Boolean(filter.checked) !== shouldBeChecked) {
        toggleTeamFilter?.(filter.id, shouldBeChecked);
      }
    });
    setMemberOverlayOpen(false);
  };

  return (
    <MainContent className={SCHEDULE_VIEW_CLASS}>
      {tier === 'mobile' ? (
        <div className={SCHEDULE_MOBILE_TOP_ROW_CLASS}>
          <MobileMenuButton onClick={() => onOpenMobileMenu?.()} />
          <WeekSelector
            viewDate={viewDate}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onViewDateChange={onViewDateChange}
            className="flex-1"
            bookingRequests={bookingRequests}
            onConfirmBookingRequest={onConfirmBookingRequest}
            onRejectBookingRequest={onRejectBookingRequest}
          />
          {selectedMembers[0] && (
            <button type="button" onClick={() => setMemberOverlayOpen(true)} aria-label="Elegir empleado">
              <Image name={selectedMembers[0]} src={visibleMemberPhoto} className={SCHEDULE_MOBILE_AVATAR_CLASS} />
            </button>
          )}
        </div>
      ) : (
        <WeekSelector
          viewDate={viewDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onViewDateChange={onViewDateChange}
        />
      )}
      <Schedule
        selectedDate={selectedDate}
        members={selectedMembers}
        blockedMembers={blockedMembers}
        previewService={previewService}
        pendingSlot={pendingSlot}
        onSlotClick={onSlotClick}
        onAppointmentClick={onAppointmentClick}
        appointmentsVersion={appointmentsVersion}
        scrollToTime={scrollToTime}
        onScrollConsumed={onScrollConsumed}
        onOpenAddShift={onOpenAddShift}
        addShiftOpen={addShiftOpen}
        onCloseAddShift={onCloseAddShift}
        blockModeOpen={blockModeOpen}
        onToggleBlockMode={onToggleBlockMode}
        onSaveBlockMode={onSaveBlockMode}
        onCancelBlockMode={onCancelBlockMode}
        onNoticeMessage={onNoticeMessage}
        onBlocksVersionChange={onBlocksVersionChange}
        teamFilters={teamFilters}
        toggleTeamFilter={toggleTeamFilter}
        onMemberDetails={onMemberDetails}
        onBlockClick={onBlockClick}
        blocksVersion={blocksVersion}
        onColumnCapacityChange={onColumnCapacityChange}
      />

      {tier === 'mobile' && memberOverlayOpen && (
        <MobileOverlay onClose={() => setMemberOverlayOpen(false)}>
          <ContentHeader title="Equipo" />
          <div className={SCHEDULE_MOBILE_MEMBER_LIST_CLASS}>
            {teamFilters?.map((filter) => (
              <DetailsPanelOptionRow
                key={filter.id}
                option={filter}
                selectedId={currentMemberId}
                onOptionClick={(option) => selectOnlyMember(option.id)}
              />
            ))}
          </div>
        </MobileOverlay>
      )}

      {children}
    </MainContent>
  );
}
