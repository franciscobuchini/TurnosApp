/*
  src/components/views/sidebarViews/EditBlockSidebar.tsx
  Sidebar de "ver bloqueo": se abre al clickear una tarjeta "Horario
  bloqueado" ya confirmada en el Schedule (Dashboard.tsx controla
  editingBlock) — mismo patrón que EditAppointmentSidebar para turnos, pero
  sólo lectura + "Cancelar bloqueo" (elimina): a diferencia de un turno, un
  bloqueo no tiene servicio/cliente/notas que editar, así que no hace falta
  un modo edición aparte.
*/

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Sidebar from '@/components/layout/Sidebar';
import ContentHeader from '@/components/ui/content-header';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Image from '@/components/ui/image';
import CancelButton from '@/components/buttons/CancelButton';
import DeleteButton from '@/components/buttons/DeleteButton';
import type { ScheduleBlock } from '@/database/types';
import { getDayName, getMonthName } from '@/utils/dateName';

interface EditBlockSidebarProps {
  block: ScheduleBlock;
  onClose: () => void;
  onCancelBlock: (id: string) => void;
}

/* Mismas clases que EditAppointmentSidebar (mismo patrón de sidebar de
   detalle), acá sin duplicar el archivo entero. */
const CARD_CLASS = 'flex w-full flex-col rounded-4xl border border-border bg-card px-4 py-3';

const HEADER_CLASS = 'px-0 pt-0 pb-2';

const ROW_CLASS = 'flex items-center justify-between gap-3 py-2.5';

const ROW_LABEL_CLASS = 'text-sm text-muted-foreground';

const ROW_VALUE_CLASS = 'flex items-center gap-2 text-sm font-medium text-foreground';

const ROW_AVATAR_CLASS = 'h-6 w-6 shrink-0 text-[10px]';

const ACTIONS_CLASS = 'mt-1 flex items-center gap-2 border-t border-border/60 pt-3';

interface InfoRowProps {
  label: string;
  value: string;
  avatarLabel?: string;
}

function InfoRow({ label, value, avatarLabel }: InfoRowProps) {
  return (
    <div className={ROW_CLASS}>
      <span className={ROW_LABEL_CLASS}>{label}</span>
      <span className={twMerge(ROW_VALUE_CLASS, !avatarLabel && 'text-right font-normal text-muted-foreground')}>
        {avatarLabel && <Image name={avatarLabel} className={ROW_AVATAR_CLASS} />}
        {value}
      </span>
    </div>
  );
}

export default function EditBlockSidebar({ block, onClose, onCancelBlock }: EditBlockSidebarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const blockDate = new Date(`${block.date}T00:00:00`);
  const formattedDate = `${getDayName(blockDate)} ${blockDate.getDate()} de ${getMonthName(blockDate)}`;
  /* "Día completo" en horas de reloj (00:00-24:00) es la forma exacta en
     que se persiste un bloqueo o desbloqueo de día entero (negocio o miembro). */
  const isFullDay = block.startTime === '00:00' && block.endTime === '24:00';
  const scheduleLabel = isFullDay ? 'Día completo' : `${block.startTime} – ${block.endTime}`;
  const isUnblock = block.type === 'unblock';
  const title = isUnblock ? 'Horario desbloqueado' : 'Horario bloqueado';
  const cancelText = isUnblock ? 'Cancelar desbloqueo' : 'Cancelar bloqueo';

  return (
    <Sidebar footer={<CancelButton text="Volver" onClick={onClose} className="w-full" />}>
      <div className={CARD_CLASS}>
        <ContentHeader
          title={title}
          subtitle={`${formattedDate} · ${scheduleLabel}`}
          className={HEADER_CLASS}
        />

        {block.member ? (
          <InfoRow label="Miembro" value={block.member} avatarLabel={block.member} />
        ) : (
          <InfoRow label="Alcance" value="Todo el negocio" />
        )}
        <InfoRow label="Horario" value={scheduleLabel} />
        {block.reason && <InfoRow label="Motivo" value={block.reason} />}

        <div className={ACTIONS_CLASS}>
          <DeleteButton
            text={cancelText}
            onClick={() => setConfirmOpen(true)}
            className="w-full"
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isUnblock ? '¿Cancelar este desbloqueo?' : '¿Cancelar este bloqueo?'}
        description={`Se va a eliminar el ${isUnblock ? 'desbloqueo' : 'bloqueo'} de ${formattedDate} (${scheduleLabel}). Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={() => onCancelBlock(block.id)}
      />
    </Sidebar>
  );
}
