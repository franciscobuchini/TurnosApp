import { ChevronLeft } from 'lucide-react';
import Button from '../../interface/Button';
import MainHeader from '../../interface/MainHeader';
import FormAddService from '../../widgets/serviceWidgets/FormAddService';

export const ADD_SERVICE_VIEW_TITLE = 'Agregar un nuevo servicio';

interface AddServiceViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}

const AddServiceViewClasses = {
  required: 'flex h-full w-full flex-col gap-(--size-m) text-white',
  style: '',
};

const AddServiceBackButtonClasses = {
  required: 'h-(--size-2xl) w-(--size-2xl) p-0',
  style: 'text-neutral-900 bg-transparent',
};

const AddServiceFooterButtonClasses = {
  cancel: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-neutral-50 text-neutral-900',
  },
  confirm: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-neutral-900 text-white',
  },
};

const AddServiceFooterClasses = {
  required: 'flex justify-end gap-3 pt-(--size-m)',
  style: '',
};

export default function AddServiceView({
  open = true,
  onClose,
  title = ADD_SERVICE_VIEW_TITLE,
  onBack,
}: AddServiceViewProps) {
  if (!open) return null;

  const handleBack = onBack ?? onClose;
  const handleCancel = handleBack;
  const handleConfirm = onClose ?? onBack;

  return (
    <div className={AddServiceViewClasses.required}>
      <MainHeader
        title={title}
        action={
          <Button
            className={`${AddServiceBackButtonClasses.required} ${AddServiceBackButtonClasses.style}`.trim()}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <FormAddService />
      <div className={`${AddServiceFooterClasses.required} ${AddServiceFooterClasses.style}`.trim()}>
        <Button
          className={`${AddServiceFooterButtonClasses.cancel.required} ${AddServiceFooterButtonClasses.cancel.style}`.trim()}
          onClick={handleCancel}
          text="Cancelar"
        />
        <Button
          className={`${AddServiceFooterButtonClasses.confirm.required} ${AddServiceFooterButtonClasses.confirm.style}`.trim()}
          onClick={handleConfirm}
          text="Confirmar"
        />
      </div>
    </div>
  );
}
