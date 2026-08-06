import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { getOpeningHours, getTeamMembers } from '../../database/data';
import type { TeamMember } from '../../database/types';
import MainContent from '../layout/MainContent';
import Button from '../interface/Button';
import MainHeader from '../interface/MainHeader';
import FormAddEntity from '../widgets/entityWidgets/FormAddEntity';

export const ADD_ENTITY_VIEW_TITLE = 'Agregar un nuevo miembro';

type EntityViewMode = 'create' | 'view';

interface MemberDraftValues {
  name: string;
  role: string;
  phone: string;
  email: string;
  services: string[];
  photo?: string;
}

export interface AddEntityViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
  mode?: EntityViewMode;
  memberName?: string;
  onConfirm?: (member: TeamMember) => void;
  onDelete?: () => void;
}

const ADD_ENTITY_CONTENT_CLASS = 'flex min-h-0 flex-1 w-full rounded-3xl bg-neutral-50 p-(--size-m)';
const ADD_ENTITY_FORM_COLUMN_CLASS = 'flex min-h-0 w-full flex-col justify-center';
const TWO_COLUMN_LAYOUT_CLASS = 'flex w-full flex-1 flex-col gap-(--size-m) md:flex-row';
const FIRST_COLUMN_CLASS = 'flex w-full flex-1 flex-col';
const SECOND_COLUMN_CLASS = 'flex w-full flex-1 flex-col';

export default function AddEntityView({
  open = true,
  onClose,
  title = ADD_ENTITY_VIEW_TITLE,
  onBack,
  mode = 'create',
  memberName,
  onConfirm,
  onDelete,
}: AddEntityViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValues, setDraftValues] = useState<MemberDraftValues>({
    name: '',
    role: '',
    phone: '',
    email: '',
    services: [],
    photo: undefined,
  });

  if (!open) return null;

  const resolvedMode = isEditing ? 'edit' : mode;
  const teamMembers = getTeamMembers();
  const selectedMember = teamMembers.find((member) => member.name === memberName) ?? teamMembers[0];

  const formValues =
    mode === 'create'
      ? { name: '', role: '', phone: '', email: '', services: [], photo: undefined }
      : {
          name: selectedMember?.name ?? '',
          role: selectedMember?.role ?? '',
          phone: selectedMember?.phone ?? '',
          email: selectedMember?.email ?? '',
          services: selectedMember?.services ?? [],
          photo: selectedMember?.photo,
        };

  const buildMember = (): TeamMember => ({
    name: draftValues.name.trim(),
    role: draftValues.role.trim(),
    email: draftValues.email.trim(),
    phone: draftValues.phone.trim(),
    services: draftValues.services,
    photo: draftValues.photo,
    schedule: mode === 'create' ? getOpeningHours() : selectedMember?.schedule ?? [],
  });

  const handleBack = onBack ?? onClose;
  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }

    handleBack?.();
  };
  const handleConfirm = () => {
    if (mode === 'view' && !isEditing) {
      setIsEditing(true);
      return;
    }

    onConfirm?.(buildMember());
    onClose?.();
  };
  const actionLabel = isEditing ? 'Guardar' : mode === 'view' ? 'Editar' : 'Confirmar';
  const cancelLabel = isEditing ? 'Cancelar' : mode === 'view' ? 'Volver' : 'Cancelar';

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
        <div className={TWO_COLUMN_LAYOUT_CLASS}>
          <div className={FIRST_COLUMN_CLASS}>
            <div className={ADD_ENTITY_CONTENT_CLASS}>
              <div className={ADD_ENTITY_FORM_COLUMN_CLASS}>
                <FormAddEntity mode={resolvedMode} initialValues={formValues} onValuesChange={setDraftValues} />
              </div>
            </div>
          </div>
          <div className={SECOND_COLUMN_CLASS} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-(--size-m)">
        <Button className="px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-50 text-neutral-900" onClick={handleCancel} text={cancelLabel} />
        <Button className="px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-900 text-white" onClick={handleConfirm} text={actionLabel} />
        {mode === 'view' && !isEditing && onDelete ? (
          <Button
            className="px-(--size-l) py-(--size-s) rounded-2xl bg-red-500 text-white"
            onClick={onDelete}
            text="Eliminar"
          />
        ) : null}
      </div>
    </MainContent>
  );
}
