import { useState } from 'react';
import { getservices } from '../../database/data';
import type { service } from '../../database/types';
import ViewLayout from '../layout/ViewLayout';
import FormAddService from '../widgets/serviceWidgets/FormAddService';
import ServicePreviewCard from '../widgets/serviceWidgets/ServicePreviewCard';
import { SERVICE_COLOR_BY_ID, SERVICE_COLORS } from '../widgets/serviceWidgets/serviceColors';
import CancelButton from '../buttons/CancelButton';
import ConfirmButton from '../buttons/ConfirmButton';
import DeleteButton from '../buttons/DeleteButton';

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
  photoIndex: number | null;
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
  photoIndex: null,
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
    photo: selectedService?.photo,
  };

  const [isFormValid, setIsFormValid] = useState(false);
  const [draftValues, setDraftValues] = useState<ServiceDraftValues>(EMPTY_DRAFT);

  if (!open) return null;

  const buildService = (): service => ({
    name: draftValues.name.trim(),
    colorId: draftValues.colorId,
    description: draftValues.description.trim(),
    price: Number(draftValues.price) || 0,
    duration: draftValues.duration,
    photo: selectedService?.photo ?? '',
  });

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
  const actionLabel = mode === 'edit' ? 'Guardar' : mode === 'view' ? 'Editar' : 'Confirmar';
  const cancelLabel = mode === 'view' ? 'Volver' : 'Cancelar';
  const isConfirmDisabled = mode === 'create' && !isFormValid;

  const previewColor = SERVICE_COLOR_BY_ID[draftValues.colorId] ?? SERVICE_COLORS[0];
  const previewDuration = draftValues.duration.replace(/\s*min$/i, '');

  return (
    <ViewLayout
      title={title}
      onBack={handleBack}
      left={
        <FormAddService
          mode={mode}
          initialValues={formValues}
          onValidityChange={setIsFormValid}
          onValuesChange={setDraftValues}
        />
      }
      right={
        <div className="flex flex-1 flex-col items-center justify-center rounded-4xl">
          <ServicePreviewCard
            name={draftValues.name}
            description={draftValues.description}
            duration={previewDuration}
            price={draftValues.price}
            colorClassName={previewColor.className}
            selectedPhotoIndex={draftValues.photoIndex}
          />
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