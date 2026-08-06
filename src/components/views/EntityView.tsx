import { ChevronLeft } from 'lucide-react';
import { getTeamMembers } from '../../database/data';
import MainContent from '../layout/MainContent';
import Button from '../interface/Button';
import MainHeader from '../interface/MainHeader';
import FormAddEntity from '../widgets/entityWidgets/FormAddEntity';

export const ADD_ENTITY_VIEW_TITLE = 'Agregar un nuevo miembro';

type EntityViewMode = 'create' | 'view';

export interface AddEntityViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
  mode?: EntityViewMode;
  memberName?: string;
}

const ADD_ENTITY_CONTENT_CLASS = 'flex min-h-0 flex-1 w-full rounded-3xl bg-neutral-50 p-(--size-m)';
const ADD_ENTITY_FORM_COLUMN_CLASS = 'flex min-h-0 w-full flex-col justify-center';
const VIEW_ENTITY_CONTENT_CLASS = 'flex flex-1 w-full items-start rounded-3xl bg-neutral-50 p-(--size-m)';

export default function AddEntityView({
  open = true,
  onClose,
  title = ADD_ENTITY_VIEW_TITLE,
  onBack,
  mode = 'create',
  memberName,
}: AddEntityViewProps) {
  if (!open) return null;

  const teamMembers = getTeamMembers();
  const selectedMember = teamMembers.find((member) => member.name === memberName) ?? teamMembers[0];

  const handleBack = onBack ?? onClose;
  const handleCancel = handleBack;
  const handleConfirm = onClose ?? onBack;
  const actionLabel = mode === 'view' ? 'Editar' : 'Confirmar';
  const cancelLabel = mode === 'view' ? 'Volver' : 'Cancelar';

  return (
    <MainContent>
      <MainHeader
        title={title}
        action={
          <Button
            className="h-(--size-2xl) w-(--size-2xl) p-0 text-neutral-900 bg-transparent"
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <div className="flex min-h-0 flex-1 flex-col">
        {mode === 'view' ? (
          <div className={VIEW_ENTITY_CONTENT_CLASS}>
            <div className="flex h-full w-full flex-col gap-(--size-m) rounded-3xl border border-neutral-200 bg-white p-(--size-m) shadow-sm">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{selectedMember?.name ?? 'Miembro sin nombre'}</h3>
                <p className="text-sm text-neutral-600">{selectedMember?.role ?? 'Sin rol asignado'}</p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-start justify-between gap-(--size-m) border-b border-neutral-100 pb-2">
                  <span className="font-medium text-neutral-700">Email</span>
                  <span className="text-right text-neutral-900">{selectedMember?.email ?? '—'}</span>
                </div>
                <div className="flex items-start justify-between gap-(--size-m) border-b border-neutral-100 pb-2">
                  <span className="font-medium text-neutral-700">Teléfono</span>
                  <span className="text-right text-neutral-900">{selectedMember?.phone ?? '—'}</span>
                </div>
                <div className="flex items-start justify-between gap-(--size-m) border-b border-neutral-100 pb-2">
                  <span className="font-medium text-neutral-700">Servicios</span>
                  <span className="text-right text-neutral-900">{selectedMember?.services.join(', ') ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={ADD_ENTITY_CONTENT_CLASS}>
            <div className={ADD_ENTITY_FORM_COLUMN_CLASS}>
              <FormAddEntity />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-(--size-m)">
        <Button className="px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-50 text-neutral-900" onClick={handleCancel} text={cancelLabel} />
        <Button className="px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-900 text-white" onClick={handleConfirm} text={actionLabel} />
      </div>
    </MainContent>
  );
}
