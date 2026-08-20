/*
  src/components/views/sidebarViews/AdminSidebar.tsx
  Estado por defecto de la sidebar del admin (agenda): Calendario y
  Notificaciones (solicitudes de turno pendientes desde /site), siempre
  visibles a la vez, compartiendo el espacio de la sidebar — a diferencia
  del resto de los estados de sidebar (Agregar turno, Notificaciones-como-
  overlay-mobile, Equipo/Servicios/Clientes, ver EntitySidebarPanel.tsx),
  éste no reemplaza nada ni se cierra: es el estado de reposo.

  Equipo/Servicios/Clientes vivían acá antes, como acordeón junto al
  Calendar — se movieron a accesos propios en AppMenubar.tsx (ver
  sidebarPanel en Dashboard.tsx), que reemplazan esta sidebar entera por
  EntitySidebarPanel al abrirse, así que ya no compiten por espacio acá.

  El contenido de Notificaciones (NotificationsList) es el mismo que usa el
  overlay a pantalla completa de WeekSelector.tsx en mobile, sin título
  propio: va directo debajo del Calendar.
*/

import Sidebar from '../../layout/Sidebar';
import Calendar from '../../widgets/sidebarWidgets/Calendar';
import { NotificationsList } from './NotificationsList';
import type { BookingRequest } from '../../../database/types';

interface AdminSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  bookingRequests: BookingRequest[];
  onConfirmBookingRequest: (request: BookingRequest) => void;
  onRejectBookingRequest: (request: BookingRequest) => void;
}

export default function AdminSidebar({
  selectedDate,
  onSelectDate,
  bookingRequests,
  onConfirmBookingRequest,
  onRejectBookingRequest,
}: AdminSidebarProps) {
  return (
    <Sidebar>
      <Calendar selectedDate={selectedDate} onSelectDate={onSelectDate} />

      <NotificationsList
        requests={bookingRequests}
        onConfirm={onConfirmBookingRequest}
        onReject={onRejectBookingRequest}
      />
    </Sidebar>
  );
}
