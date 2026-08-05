import { ChevronLeft } from 'lucide-react';
import Button from '../../interface/Button';
import MainHeader from '../../interface/MainHeader';

export const ADD_ENTITY_VIEW_TITLE = 'Agregar un nuevo miembro';

interface AddEntityViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}

const AddEntityViewClasses = {
  required: 'flex h-full w-full flex-col gap-(--size-m) text-white',
  style: '',
};

const AddEntityBackButtonClasses = {
  required: 'h-(--size-2xl) w-(--size-2xl) p-0',
  style: 'text-gray-900 bg-transparent',
};

const AddEntityFooterButtonClasses = {
  cancel: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-gray-50 text-gray-900',
  },
  confirm: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-gray-900 text-white',
  },
};

const AddEntityFooterClasses = {
  required: 'flex justify-end gap-3 pt-(--size-m)',
  style: '',
};

const AddEntityContentClasses = {
  required: 'flex flex-1 items-center justify-center rounded-3xl bg-gray-50 p-(--size-m)',
  style: '',
};

export default function AddEntityView({
  open = true,
  onClose,
  title = ADD_ENTITY_VIEW_TITLE,
  onBack,
}: AddEntityViewProps) {
  if (!open) return null;

  const handleBack = onBack ?? onClose;
  const handleCancel = handleBack;
  const handleConfirm = onClose ?? onBack;

  return (
    <div className={AddEntityViewClasses.required}>
      <MainHeader
        title={title}
        action={
          <Button
            className={`${AddEntityBackButtonClasses.required} ${AddEntityBackButtonClasses.style}`.trim()}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <div className={AddEntityContentClasses.required}>
      </div>
      <div className={`${AddEntityFooterClasses.required} ${AddEntityFooterClasses.style}`.trim()}>
        <Button
          className={`${AddEntityFooterButtonClasses.cancel.required} ${AddEntityFooterButtonClasses.cancel.style}`.trim()}
          onClick={handleCancel}
          text="Cancelar"
        />
        <Button
          className={`${AddEntityFooterButtonClasses.confirm.required} ${AddEntityFooterButtonClasses.confirm.style}`.trim()}
          onClick={handleConfirm}
          text="Confirmar"
        />
      </div>
    </div>
  );
}
