import { ChevronLeft } from 'lucide-react';
import Button from '../../interface/Button';
import MainHeader from '../../interface/MainHeader';

interface ViewEntityViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}

const ViewEntityViewClasses = {
  required: 'flex h-full w-full flex-col gap-(--size-m) text-white',
  style: '',
};

const ViewEntityBackButtonClasses = {
  required: 'h-(--size-2xl) w-(--size-2xl) p-0',
  style: 'text-neutral-900 bg-transparent',
};

const ViewEntityFooterButtonClasses = {
  cancel: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-neutral-50 text-neutral-900',
  },
  confirm: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-neutral-900 text-white',
  },
};

const ViewEntityFooterClasses = {
  required: 'flex justify-end gap-3 pt-(--size-m)',
  style: '',
};

const ViewEntityContentClasses = {
  required: 'flex flex-1 items-center justify-center rounded-3xl bg-neutral-50 p-(--size-m)',
  style: '',
};

export default function ViewEntityView({
  open = true,
  onClose,
  title = 'Perfil de miembro',
  onBack,
}: ViewEntityViewProps) {
  if (!open) return null;

  const handleBack = onBack ?? onClose;
  const handleCancel = handleBack;
  const handleConfirm = onClose ?? onBack;

  return (
    <div className={ViewEntityViewClasses.required}>
      <MainHeader
        title={title}
        action={
          <Button
            className={`${ViewEntityBackButtonClasses.required} ${ViewEntityBackButtonClasses.style}`.trim()}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <div className={ViewEntityContentClasses.required}>
      </div>
      <div className={`${ViewEntityFooterClasses.required} ${ViewEntityFooterClasses.style}`.trim()}>
        <Button
          className={`${ViewEntityFooterButtonClasses.cancel.required} ${ViewEntityFooterButtonClasses.cancel.style}`.trim()}
          onClick={handleCancel}
          text="Cancelar"
        />
        <Button
          className={`${ViewEntityFooterButtonClasses.confirm.required} ${ViewEntityFooterButtonClasses.confirm.style}`.trim()}
          onClick={handleConfirm}
          text="Confirmar"
        />
      </div>
    </div>
  );
}
