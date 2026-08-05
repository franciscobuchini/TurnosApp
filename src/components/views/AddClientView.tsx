import { ChevronLeft } from 'lucide-react';
import Button from '../interface/Button';
import MainHeader from '../widgets/MainHeader';

export const ADD_CLIENT_VIEW_TITLE = 'Agregar nuevo cliente';

interface AddClientViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}

const AddClientViewClasses = {
  required: 'flex h-full w-full flex-col gap-(--size-m) text-white',
  style: '',
};

const AddClientContentClasses = {
  required: 'flex flex-1 items-center justify-center rounded-[1.5rem] bg-gray-50 p-(--size-m)',
  style: '',
};

const AddClientBackButtonClasses = {
  required: 'h-(--size-xl) w-(--size-xl) rounded-full bg-gray-900 p-0 text-white hover:bg-gray-900',
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
  return (
    <div className={AddClientViewClasses.required}>
      <MainHeader
        title={title}
        action={
          <Button
            className={AddClientBackButtonClasses.required}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-m)" />}
            aria-label="Volver"
          />
        }
      />
      <div className={AddClientContentClasses.required}>
      </div>
    </div>
  );
}
