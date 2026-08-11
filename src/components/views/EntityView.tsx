import { useState } from 'react';

import { getOpeningHours, getTeamMembers } from '../../database/data';
import type { OpeningHoursEntry, TeamMember } from '../../database/types';

import ViewLayout from '../layout/ViewLayout';

import FormAddEntity from '../widgets/entityWidgets/FormAddEntity';
import WeekSchedule from '../widgets/entityWidgets/WeekSchedule';

export const ADD_ENTITY_VIEW_TITLE = 'Agregar un nuevo miembro';

type EntityViewMode = 'create' | 'view';

interface MemberDraftValues {
  name: string;
  role: string;
  phone: string;
  email: string;
  services: string[];
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

const EMPTY_MEMBER: MemberDraftValues = {
  name: '',
  role: '',
  phone: '',
  email: '',
  services: [],
};

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
  const member = getTeamMembers().find(
    (member) => member.name === memberName,
  );

  const initialValues =
    mode === 'create'
      ? EMPTY_MEMBER
      : {
          name: member?.name ?? '',
          role: member?.role ?? '',
          phone: member?.phone ?? '',
          email: member?.email ?? '',
          services: member?.services ?? [],
        };

  const [editing, setEditing] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [values, setValues] = useState<MemberDraftValues>(initialValues);

  const [schedule, setSchedule] = useState<OpeningHoursEntry[]>(
    mode === 'create' || !Array.isArray(member?.schedule)
      ? getOpeningHours()
      : member.schedule,
  );

  if (!open) return null;

  const resolvedMode = editing ? 'edit' : mode;
  const handleBack = onBack ?? onClose;

  const handleCancel = () => {
    if (editing) {
      setValues(initialValues);
      setEditing(false);
      return;
    }

    handleBack?.();
  };

  const handleConfirm = () => {
    if (mode === 'view' && !editing) {
      setEditing(true);
      return;
    }

    onConfirm?.({
      ...values,
      name: values.name.trim(),
      role: values.role.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      schedule,
    });

    if (mode === 'view') {
      setEditing(false);
      return;
    }

    onClose?.();
  };

  const actionLabel =
    editing ? 'Guardar' : mode === 'view' ? 'Editar' : 'Confirmar';

  const cancelLabel =
    editing ? 'Cancelar' : mode === 'view' ? 'Volver' : 'Cancelar';

  return (
    <ViewLayout
      title={title}
      left={
        <FormAddEntity
          key={mode === 'create' ? 'create' : member?.name}
          mode={resolvedMode}
          initialValues={initialValues}
          onValidityChange={setIsFormValid}
          onValuesChange={setValues}
        />
      }
      right={
        <WeekSchedule
          value={schedule}
          onChange={setSchedule}
          readOnly={resolvedMode === 'view'}
          businessHours={getOpeningHours()}
        />
      }
      cancelText={cancelLabel}
      onCancel={handleCancel}
      confirmText={actionLabel}
      onConfirm={handleConfirm}
      confirmDisabled={mode === 'create' && !isFormValid}
      onDelete={editing ? onDelete : undefined}
    />
  );
}