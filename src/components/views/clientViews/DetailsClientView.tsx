import { ChevronLeft } from 'lucide-react';
import Button from '../../interface/Button';
import MainHeader from '../../interface/MainHeader';

interface ViewClientViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}

const ViewClientViewClasses = {
  required: 'flex h-full w-full flex-col gap-(--size-m) text-white',
  style: '',
};

const ViewClientBackButtonClasses = {
  required: 'h-(--size-2xl) w-(--size-2xl) p-0',
  style: 'text-gray-900 bg-transparent',
};

const ViewClientFooterButtonClasses = {
  cancel: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-gray-50 text-gray-900',
  },
  confirm: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-gray-900 text-white',
  },
};

const ViewClientFooterClasses = {
  required: 'flex justify-end gap-3 pt-(--size-m)',
  style: '',
};

const ViewClientContentClasses = {
  required: 'flex flex-1 items-center justify-center rounded-3xl bg-gray-50 p-(--size-m)',
  style: '',
};

export default function ViewClientView({
  open = true,
  onClose,
  title = 'Detalles',
  onBack,
}: ViewClientViewProps) {
  if (!open) return null;

  const handleBack = onBack ?? onClose;
  const handleCancel = handleBack;
  const handleConfirm = onClose ?? onBack;

  return (
    <div className={ViewClientViewClasses.required}>
      <MainHeader
        title={title}
        action={
          <Button
            className={`${ViewClientBackButtonClasses.required} ${ViewClientBackButtonClasses.style}`.trim()}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <div className={ViewClientContentClasses.required}>
      </div>
      <div className={`${ViewClientFooterClasses.required} ${ViewClientFooterClasses.style}`.trim()}>
        <Button
          className={`${ViewClientFooterButtonClasses.cancel.required} ${ViewClientFooterButtonClasses.cancel.style}`.trim()}
          onClick={handleCancel}
          text="Cancelar"
        />
        <Button
          className={`${ViewClientFooterButtonClasses.confirm.required} ${ViewClientFooterButtonClasses.confirm.style}`.trim()}
          onClick={handleConfirm}
          text="Confirmar"
        />
      </div>
    </div>
  );
}
