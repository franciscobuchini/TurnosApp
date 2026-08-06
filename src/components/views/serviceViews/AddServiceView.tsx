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

const ADD_SERVICE_VIEW_CLASS = 'flex h-full w-full flex-col gap-(--size-m) text-white';

const ADD_SERVICE_BACK_BUTTON_CLASS = 'h-(--size-2xl) w-(--size-2xl) p-0 text-neutral-900 bg-transparent';

const ADD_SERVICE_FOOTER_BUTTON_CANCEL_CLASS = 'px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-50 text-neutral-900';
const ADD_SERVICE_FOOTER_BUTTON_CONFIRM_CLASS = 'px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-900 text-white';

const ADD_SERVICE_FOOTER_CLASS = 'flex justify-end gap-3 pt-(--size-m)';

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
    <div className={ADD_SERVICE_VIEW_CLASS}>
      <MainHeader
        title={title}
        action={
          <Button
            className={ADD_SERVICE_BACK_BUTTON_CLASS}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <FormAddService />
      <div className={ADD_SERVICE_FOOTER_CLASS}>
        <Button
          className={ADD_SERVICE_FOOTER_BUTTON_CANCEL_CLASS}
          onClick={handleCancel}
          text="Cancelar"
        />
        <Button
          className={ADD_SERVICE_FOOTER_BUTTON_CONFIRM_CLASS}
          onClick={handleConfirm}
          text="Confirmar"
        />
      </div>
    </div>
  );
}
