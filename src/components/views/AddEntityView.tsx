import { ChevronLeft } from 'lucide-react';
import Button from '../interface/Button';
import MainHeader from '../widgets/MainHeader';

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

const AddEntityContentClasses = {
  required: 'flex flex-1 items-center justify-center rounded-[1.5rem] bg-gray-50 p-(--size-m)',
  style: '',
};

const AddEntityBackButtonClasses = {
  required: 'h-(--size-xl) w-(--size-xl) rounded-full bg-gray-900 p-0 text-white hover:bg-gray-900',
  style: '',
};

export default function AddEntityView({
  open = true,
  onClose,
  title = 'Agregar miembro',
  onBack,
}: AddEntityViewProps) {
  if (!open) return null;

  const handleBack = onBack ?? onClose;
  return (
    <div className={AddEntityViewClasses.required}>
      <MainHeader
        title={title}
        action={
          <Button
            className={AddEntityBackButtonClasses.required}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-m)" />}
            aria-label="Volver"
          />
        }
      />
      <div className={AddEntityContentClasses.required}>
      </div>
    </div>
  );
}
