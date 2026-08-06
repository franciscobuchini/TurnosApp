import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { getservices } from '../../database/data';
import type { service } from '../../database/types';
import FormAddService from '../widgets/serviceWidgets/FormAddService';
import MainContent from '../layout/MainContent';
import Button from '../interface/Button';
import MainHeader from '../interface/MainHeader';

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
      onClose?.();
      return;
    }

    onEdit?.();
  };
  const actionLabel = mode === 'edit' ? 'Guardar' : mode === 'view' ? 'Editar' : 'Confirmar';
  const cancelLabel = mode === 'view' ? 'Volver' : 'Cancelar';
  const isConfirmDisabled = mode === 'create' && !isFormValid;

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
        <FormAddService
          mode={mode}
          initialValues={formValues}
          onValidityChange={setIsFormValid}
          onValuesChange={setDraftValues}
        />
      </div>
      <div className="flex justify-end gap-3 pt-(--size-m)">
        <Button className="px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-50 text-neutral-900" onClick={handleCancel} text={cancelLabel} />
        <Button className="px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-900 text-white" onClick={handleConfirm} text={actionLabel} disabled={isConfirmDisabled} />
        {mode === 'view' && onDelete ? (
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
