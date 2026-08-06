import { ChevronLeft } from 'lucide-react';
import Button from '../../interface/Button';
import MainHeader from '../../interface/MainHeader';
import FormAddClient from '../../widgets/clientWidgets/FormAddClient';

export const ADD_CLIENT_VIEW_TITLE = 'Agregar un nuevo cliente';

interface AddClientViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}

/* AddClientViewClasses: esto es el lienzo en blanco de la vista. */
const AddClientViewClasses = {
  required: 'flex h-full w-full flex-col gap-(--size-m)',
  style: '',
};

const AddClientBackButtonClasses = {
  required: 'h-(--size-2xl) w-(--size-2xl) p-0',
  style: 'text-neutral-900 bg-transparent',
};

const AddClientFooterButtonClasses = {
  cancel: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-neutral-50 text-neutral-900',
  },
  confirm: {
    required: 'px-(--size-l) py-(--size-s)',
    style: 'rounded-2xl bg-neutral-900 text-white',
  },
};

const AddClientFooterClasses = {
  required: 'flex justify-end gap-3 pt-(--size-m)',
  style: '',
};

export default function AddClientView({
  open = true,
  onClose,
  title = ADD_CLIENT_VIEW_TITLE,
  onBack,
}: AddClientViewProps) {
  if (!open) return null;

  const handleBack = onBack ?? onClose;
  const handleCancel = handleBack;
  const handleConfirm = onClose ?? onBack;

  return (
    <div className={AddClientViewClasses.required}>
      <MainHeader
        title={title}
        action={
          <Button
            className={`${AddClientBackButtonClasses.required} ${AddClientBackButtonClasses.style}`.trim()}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <FormAddClient />
      <div className={`${AddClientFooterClasses.required} ${AddClientFooterClasses.style}`.trim()}>
        <Button
          className={`${AddClientFooterButtonClasses.cancel.required} ${AddClientFooterButtonClasses.cancel.style}`.trim()}
          onClick={handleCancel}
          text="Cancelar"
        />
        <Button
          className={`${AddClientFooterButtonClasses.confirm.required} ${AddClientFooterButtonClasses.confirm.style}`.trim()}
          onClick={handleConfirm}
          text="Confirmar"
        />
      </div>
    </div>
  );
}
