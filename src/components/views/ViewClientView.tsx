import { ChevronLeft } from 'lucide-react';
import Button from '../interface/Button';
import MainHeader from '../widgets/MainHeader';

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

const ViewClientContentClasses = {
  required: 'flex flex-1 items-center justify-center rounded-[1.5rem] bg-gray-50 p-(--size-m)',
  style: '',
};

const ViewClientBackButtonClasses = {
  required: 'h-(--size-xl) w-(--size-xl) rounded-full bg-gray-900 p-0 text-white hover:bg-gray-900',
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
  return (
    <div className={ViewClientViewClasses.required}>
      <MainHeader
        title={title}
        action={
          <Button
            className={ViewClientBackButtonClasses.required}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-m)" />}
            aria-label="Volver"
          />
        }
      />
      <div className={ViewClientContentClasses.required}>
      </div>
    </div>
  );
}
