import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getClients } from '../../database/data';
import type { Client } from '../../database/types';
import MainContent from '../layout/MainContent';
import Button from '../interface/Button';
import MainHeader from '../interface/MainHeader';
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
}: AddClientViewProps) {
  if (!open) return null;

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
      onClose?.();
      return;
    }

    onEdit?.();
  };
  const actionLabel = mode === 'edit' ? 'Guardar' : mode === 'view' ? 'Editar' : 'Confirmar';
  const cancelLabel = mode === 'view' ? 'Volver' : 'Cancelar';
  const isConfirmDisabled = mode === 'create' && !isFormValid;

  const resolvedMode = mode;

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
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <FormAddClient mode={resolvedMode} initialValues={formValues} onValidityChange={setIsFormValid} onValuesChange={setDraftValues} />
      </div>
      <div className="flex justify-end gap-3 pt-(--size-m)">
        <Button className="px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-50 text-neutral-900" onClick={handleCancel} text={cancelLabel} />
        <Button className="px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-900 text-white" onClick={handleConfirm} text={actionLabel} disabled={isConfirmDisabled} />
      </div>
    </MainContent>
  );
}
