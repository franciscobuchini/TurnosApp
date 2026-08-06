import { ChevronLeft } from 'lucide-react';
import Button from '../../interface/Button';
import MainHeader from '../../interface/MainHeader';

interface ViewServiceViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}

const ViewServiceViewClasses = {
  required: 'flex h-full w-full flex-col gap-(--size-m) text-white',
  style: '',
};

const ViewServiceBackButtonClasses = {
  required: 'h-(--size-2xl) w-(--size-2xl) p-0',
  style: 'text-neutral-900 bg-transparent',
};

const ViewServiceFooterButtonClasses = {
  cancel: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-neutral-50 text-neutral-900',
  },
  confirm: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-neutral-900 text-white',
  },
};

const ViewServiceFooterClasses = {
  required: 'flex justify-end gap-3 pt-(--size-m)',
  style: '',
};

const ViewServiceContentClasses = {
  required: 'flex flex-1 items-center justify-center rounded-3xl bg-neutral-50 p-(--size-m)',
  style: '',
};

export default function ViewServiceView({
  open = true,
  onClose,
  title = 'Detalles',
  onBack,
}: ViewServiceViewProps) {
  if (!open) return null;

  const handleBack = onBack ?? onClose;
  const handleCancel = handleBack;
  const handleConfirm = onClose ?? onBack;

  return (
    <div className={ViewServiceViewClasses.required}>
      <MainHeader
        title={title}
        action={
          <Button
            className={`${ViewServiceBackButtonClasses.required} ${ViewServiceBackButtonClasses.style}`.trim()}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <div className={ViewServiceContentClasses.required}>
      </div>
      <div className={`${ViewServiceFooterClasses.required} ${ViewServiceFooterClasses.style}`.trim()}>
        <Button
          className={`${ViewServiceFooterButtonClasses.cancel.required} ${ViewServiceFooterButtonClasses.cancel.style}`.trim()}
          onClick={handleCancel}
          text="Cancelar"
        />
        <Button
          className={`${ViewServiceFooterButtonClasses.confirm.required} ${ViewServiceFooterButtonClasses.confirm.style}`.trim()}
          onClick={handleConfirm}
          text="Confirmar"
        />
      </div>
    </div>
  );
}
