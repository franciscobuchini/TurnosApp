import { useEffect, useState } from 'react';
import { getClients } from '../../database/data';
import type { Client } from '../../database/types';
import ViewLayout from '../layout/ViewLayout';
import CancelButton from '../buttons/CancelButton';
import ConfirmButton from '../buttons/ConfirmButton';
import DeleteButton from '../buttons/DeleteButton';
import FormAddClient from '../widgets/clientWidgets/FormAddClient';

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

const RIGHT_PANEL_CLASS = 'flex flex-1 flex-col items-center justify-center gap-2 rounded-4xl border-1 border-dashed border-neutral-500 text-neutral-400';

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

  const clients = clientsProp ?? getClients();
  const shouldPrefillClient = mode !== 'create' && Boolean(clientName);
  const selectedClient = shouldPrefillClient
    ? clients.find((client) => normalizeClientName(client.name) === normalizeClientName(clientName))
    : undefined;

  useEffect(() => {
    if (selectedClient) {
      setDraftValues({
        fullName: selectedClient.name ?? '',
        whatsapp: selectedClient.phone ?? '',
        email: selectedClient.email ?? '',
        notes: selectedClient.notes ?? '',
      });
      return;
    }

    if (mode === 'create') {
      setDraftValues({
        fullName: '',
        whatsapp: '',
        email: '',
        notes: '',
      });
    }
  }, [mode, selectedClient]);

  if (!open) return null;

  const formValues = {
    fullName: selectedClient?.name ?? '',
    whatsapp: selectedClient?.phone ?? '',
    email: selectedClient?.email ?? '',
    notes: selectedClient?.notes ?? '',
  };

  const handleBack = onBack ?? onClose;
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    handleBack?.();
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
  const actionLabel = mode === 'edit' ? 'Guardar' : mode === 'view' ? 'Editar' : 'Confirmar';
  const cancelLabel = mode === 'view' ? 'Volver' : 'Cancelar';
  const isConfirmDisabled = mode === 'create' && !isFormValid;

  const resolvedMode = mode;

  return (
    <ViewLayout
      title={title}
      onBack={handleBack}
      left={
        <FormAddClient mode={resolvedMode} initialValues={formValues} onValidityChange={setIsFormValid} onValuesChange={setDraftValues} />
      }
      right={
        <div className={RIGHT_PANEL_CLASS}>
          <p>Proximamente...</p>
          <p>Sistema de fidelización de clientes</p>
        </div>
      }
      footer={
        <>
          {mode === 'edit' && onDelete ? (
            <DeleteButton className="mr-auto" onClick={onDelete} text="Eliminar" />
          ) : null}
          <CancelButton onClick={handleCancel} text={cancelLabel} />
          <ConfirmButton onClick={handleConfirm} text={actionLabel} disabled={isConfirmDisabled} />
        </>
      }
    />
  );
}