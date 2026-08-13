import type { ReactNode } from 'react';
import type { Appointment } from '../../database/types';
import type { FiltersOption } from '../../database/types';
import type { ShiftSlot } from '../../pages/admin/Dashboard';
import MainContent from '../layout/MainContent';
import WeekSelector from '../widgets/mainWidgets/WeekSelector';
import Schedule from '../widgets/mainWidgets/Schedule';

const SCHEDULE_VIEW_CLASS = 'flex h-full w-full flex-col gap-3 p-3';

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
  /** Filtros del equipo: para el dropdown de acciones del header de cada
      miembro (ocultar/mostrar + ver perfil). */
  teamFilters?: FiltersOption[];
  toggleTeamFilter?: (id: string, checked: boolean) => void;
  onMemberDetails?: (name: string) => void;
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
  teamFilters,
  toggleTeamFilter,
  onMemberDetails,
  children,
}: ScheduleViewProps) {
  return (
    <MainContent className={SCHEDULE_VIEW_CLASS}>
      <WeekSelector
        viewDate={viewDate}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onViewDateChange={onViewDateChange}
      />
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
        teamFilters={teamFilters}
        toggleTeamFilter={toggleTeamFilter}
        onMemberDetails={onMemberDetails}
      />
      {children}
    </MainContent>
  );
}
