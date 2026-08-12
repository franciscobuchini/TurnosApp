import { useState } from 'react';
import { getClients } from '../../database/data';
import type { Client } from '../../database/types';
import ViewLayout from '../layout/ViewLayout';
import ComingSoonPanel from '../layout/ComingSoonPanel';
import FormAddClient from '../widgets/clientWidgets/FormAddClient';
import { useEntityViewFooter } from '@/hooks/useEntityViewFooter';

export const ADD_CLIENT_VIEW_TITLE = 'Agregar un nuevo cliente';

type ClientViewMode = 'create' | 'view' | 'edit';

function normalizeClientName(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

interface ClientDraftValues {
  fullName: string;
  whatsapp: string;
  email: string;
  notes: string;
}

export interface AddClientViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
  mode?: ClientViewMode;
  clientName?: string;
  clients?: Client[];
  onConfirm?: (client: Client) => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export default function AddClientView({
  open = true,
  onClose,
  title = ADD_CLIENT_VIEW_TITLE,
  onBack,
  mode = 'create',
  clientName,
  clients: clientsProp,
  onConfirm,
  onEdit,
  onCancel,
  onDelete,
}: AddClientViewProps) {
  const [isFormValid, setIsFormValid] = useState(false);
  const [draftValues, setDraftValues] = useState<ClientDraftValues>({
    fullName: '',
    whatsapp: '',
    email: '',
    notes: '',
  });

  const { actionLabel, cancelLabel, isConfirmDisabled, handleCancel } = useEntityViewFooter({
    mode,
    isFormValid,
    onBack,
    onClose,
    onCancel,
  });

  const clients = clientsProp ?? getClients();
  const shouldPrefillClient = mode !== 'create' && Boolean(clientName);
  const selectedClient = shouldPrefillClient
    ? clients.find((client) => normalizeClientName(client.name) === normalizeClientName(clientName))
    : undefined;

  if (!open) return null;

  const formValues = {
    fullName: selectedClient?.name ?? '',
    whatsapp: selectedClient?.phone ?? '',
    email: selectedClient?.email ?? '',
    notes: selectedClient?.notes ?? '',
  };

  const handleConfirm = () => {
    if (mode === 'create') {
      if (!isFormValid) {
        return;
      }

      onConfirm?.({
        name: draftValues.fullName.trim(),
        phone: draftValues.whatsapp.trim(),
        email: draftValues.email.trim() || undefined,
        notes: draftValues.notes.trim() || undefined,
        appointmentsCount: 0,
        totalSpent: 0,
      });
      onClose?.();
      return;
    }

    if (mode === 'edit') {
      const nextClient: Client = {
        name: draftValues.fullName.trim() || selectedClient?.name || clientName || '',
        phone: draftValues.whatsapp.trim() || selectedClient?.phone || '',
        email: draftValues.email.trim() || selectedClient?.email || undefined,
        notes: draftValues.notes.trim() || selectedClient?.notes || undefined,
        appointmentsCount: selectedClient?.appointmentsCount ?? 0,
        totalSpent: selectedClient?.totalSpent ?? 0,
      };

      onConfirm?.(nextClient);
      if (!onConfirm) onClose?.();
      return;
    }

    onEdit?.();
  };

  const resolvedMode = mode;

  return (
    <ViewLayout
      title={title}
      left={
        <FormAddClient mode={resolvedMode} initialValues={formValues} onValidityChange={setIsFormValid} onValuesChange={setDraftValues} />
      }
      right={<ComingSoonPanel subtitle="Sistema de fidelización de clientes" />}
      cancelText={cancelLabel}
      onCancel={handleCancel}
      confirmText={actionLabel}
      onConfirm={handleConfirm}
      confirmDisabled={isConfirmDisabled}
      onDelete={mode === 'edit' ? onDelete : undefined}
    />
  );
}