import { useEffect, useState } from 'react';
import { getservices } from '../../database/data';
import type { service } from '../../database/types';
import ViewLayout from '../layout/ViewLayout';
import FormAddService from '../widgets/serviceWidgets/FormAddService';
import { useEntityViewFooter } from '@/hooks/useEntityViewFooter';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export const ADD_SERVICE_VIEW_TITLE = 'Agregar un nuevo servicio';

type ServiceViewMode = 'create' | 'view' | 'edit';

function normalizeServiceName(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

interface ServiceDraftValues {
  name: string;
  colorId: string;
  duration: string;
  price: string;
  description: string;
  photo: string;
}

export interface AddServiceViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
  mode?: ServiceViewMode;
  serviceName?: string;
  services?: service[];
  onConfirm?: (service: service) => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

const EMPTY_DRAFT: ServiceDraftValues = {
  name: '',
  colorId: 'lima',
  duration: '',
  price: '',
  description: '',
  photo: '',
};

export default function AddServiceView({
  open = true,
  onClose,
  title = ADD_SERVICE_VIEW_TITLE,
  onBack,
  mode = 'create',
  serviceName,
  services: servicesProp,
  onConfirm,
  onEdit,
  onCancel,
  onDelete,
}: AddServiceViewProps) {
  const services = servicesProp ?? getservices();
  const shouldPrefillService = mode !== 'create' && Boolean(serviceName);
  const selectedService = shouldPrefillService
    ? services.find((service) => normalizeServiceName(service.name) === normalizeServiceName(serviceName))
    : undefined;

  const formValues = {
    name: selectedService?.name ?? '',
    description: selectedService?.description ?? '',
    duration: selectedService?.duration ?? '',
    price: selectedService?.price != null ? String(selectedService.price) : '',
    colorId: selectedService?.colorId ?? 'lima',
    photo: selectedService?.photo ?? '',
  };

  const [isFormValid, setIsFormValid] = useState(false);
  const [draftValues, setDraftValues] = useState<ServiceDraftValues>(EMPTY_DRAFT);

  const { actionLabel, cancelLabel, isConfirmDisabled, handleCancel } = useEntityViewFooter({
    mode,
    isFormValid,
    onBack,
    onClose,
    onCancel,
  });

  const isDirty =
    draftValues.name !== formValues.name ||
    draftValues.description !== formValues.description ||
    draftValues.duration !== formValues.duration ||
    draftValues.price !== formValues.price ||
    draftValues.colorId !== formValues.colorId ||
    draftValues.photo !== formValues.photo;

  const { setDirty } = useUnsavedChanges();
  useEffect(() => {
    setDirty(isDirty);
    return () => setDirty(false);
  }, [isDirty, setDirty]);

  if (!open) return null;

  const buildService = (): service => ({
    name: draftValues.name.trim(),
    colorId: draftValues.colorId,
    description: draftValues.description.trim(),
    price: Number(draftValues.price) || 0,
    duration: draftValues.duration,
    photo: draftValues.photo.trim(),
  });

  const handleConfirm = () => {
    if (mode === 'create') {
      if (!isFormValid) {
        return;
      }

      onConfirm?.(buildService());
      onClose?.();
      return;
    }

    if (mode === 'edit') {
      onConfirm?.(buildService());
      if (!onConfirm) onClose?.();
      return;
    }

    onEdit?.();
  };

  return (
    <ViewLayout
      title={title}
      left={
        <FormAddService
          mode={mode}
          initialValues={formValues}
          onValidityChange={setIsFormValid}
          onValuesChange={setDraftValues}
        />
      }
      cancelText={cancelLabel}
      onCancel={handleCancel}
      confirmText={actionLabel}
      onConfirm={handleConfirm}
      confirmDisabled={isConfirmDisabled}
      onDelete={mode === 'edit' ? onDelete : undefined}
    />
  );
}