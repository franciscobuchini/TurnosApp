/*
  src/components/views/sidebarViews/NotificationsList.tsx
  Solicitudes de turno pendientes (desde /site): lista de cards (o empty
  state) para revisar los datos de cada solicitud, confirmarla
  (agregándola automáticamente a la agenda) o rechazarla.
  Sigue el mismo patrón visual que EditAppointmentSidebar: CARD_CLASS,
  ROW_CLASS, ContentHeader, CancelButton, ConfirmButton, DeleteButton.

  Sin <Sidebar> propio (a diferencia de otros estados de sidebar, ej.
  EditAppointmentSidebar): quien la usa ya está embebiéndola dentro de un
  <Sidebar> ajeno, junto al Calendar — en pc, el de AdminSidebar.tsx; en
  mobile, el del overlay a pantalla completa de WeekSelector.tsx.
*/

import { Bell } from 'lucide-react';
import ContentHeader from '@/components/ui/content-header';

import ConfirmButton from '@/components/buttons/ConfirmButton';
import DeleteButton from '@/components/buttons/DeleteButton';
import Image from '@/components/ui/image';
import type { BookingRequest } from '@/database/types';
import { currencyFormatter } from '@/database/data';
import { formatDateKeyToDisplay } from '@/utils/dateName';

interface NotificationsListProps {
  requests: BookingRequest[];
  onConfirm: (request: BookingRequest) => void;
  onReject: (request: BookingRequest) => void;
}

/* Mismas constantes de estilo que EditAppointmentSidebar para que las cards
   de solicitudes sean visualmente idénticas al resto de la app. */
const CARD_CLASS = 'flex w-full flex-col rounded-4xl border border-border bg-card px-4 py-3';

const HEADER_CLASS = 'px-0 pt-0 pb-2';

const ROW_CLASS = 'flex items-center justify-between gap-3 py-2.5';

const ROW_LABEL_CLASS = 'text-sm text-muted-foreground';

const ROW_VALUE_CLASS = 'flex items-center gap-2 text-sm font-medium text-foreground';

const ROW_AVATAR_CLASS = 'h-6 w-6 shrink-0 text-[10px]';

const ACTIONS_CLASS = 'mt-1 flex items-center gap-2 border-t border-border/60 pt-3';

const ACTION_BUTTON_CLASS = 'h-10 min-w-0 flex-1 px-3 text-sm';

function InfoRow({ label, value, avatarLabel }: { label: string; value: string; avatarLabel?: string }) {
  return (
    <div className={ROW_CLASS}>
      <span className={ROW_LABEL_CLASS}>{label}</span>
      <span className={ROW_VALUE_CLASS}>
        {avatarLabel && <Image name={avatarLabel} className={ROW_AVATAR_CLASS} />}
        <span className="truncate max-w-[160px]">{value}</span>
      </span>
    </div>
  );
}

export function NotificationsList({
  requests,
  onConfirm,
  onReject,
}: NotificationsListProps) {
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const count = pendingRequests.length;

  return (
    <>

      {/* Empty State */}
      {count === 0 ? (
        <div className={CARD_CLASS + ' flex-1 justify-center'}>
          <div className="flex flex-col items-center justify-center gap-2.5 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
              <Bell className="size-5 opacity-60" />
            </div>
            <p className="text-sm font-medium text-foreground">Panel de notificaciones</p>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              Las reservas de tus clientes desde la web van a aparecer acá.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pendingRequests.map((req) => {
            const formattedDate = formatDateKeyToDisplay(req.date);
            const priceDisplay =
              req.price !== undefined && req.price > 0
                ? currencyFormatter.format(req.price)
                : undefined;

            return (
              <div key={req.id} className={CARD_CLASS}>
                <ContentHeader
                  title={req.service}
                  subtitle={`${formattedDate} · ${req.startTime} – ${req.endTime}`}
                  className={HEADER_CLASS}
                />

                <InfoRow label="Cliente" value={req.client.name} avatarLabel={req.client.name} />
                <InfoRow label="Profesional" value={req.member} avatarLabel={req.member} />
                {priceDisplay && <InfoRow label="Precio" value={priceDisplay} />}
                {req.client.phone && (
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Teléfono</span>
                    <a
                      href={`https://wa.me/${req.client.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                      title="Enviar WhatsApp"
                    >
                      {req.client.phone}
                    </a>
                  </div>
                )}
                {req.client.email && <InfoRow label="Email" value={req.client.email} />}
                {req.client.notes && <InfoRow label="Notas" value={req.client.notes} />}

                {/* Actions */}
                <div className={ACTIONS_CLASS}>
                  <DeleteButton text="Rechazar" onClick={() => onReject(req)} className={ACTION_BUTTON_CLASS} />
                  <ConfirmButton text="Confirmar" onClick={() => onConfirm(req)} className={ACTION_BUTTON_CLASS} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
