import { ChevronLeft } from 'lucide-react';
import Button from '../interface/Button';
import MainHeader from '../widgets/MainHeader';

interface AddServiceViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}

export default function AddServiceView({
  open = true,
  onClose,
  title = 'Agregar servicio',
  onBack,
}: AddServiceViewProps) {
  if (!open) return null;

  const handleBack = onBack ?? onClose;
  return (
    <div className="flex h-full w-full flex-col gap-(--size-m) text-white">
      <MainHeader
        title={title}
        action={
          <Button
            className="h-(--size-xl) w-(--size-xl) rounded-full bg-gray-900 p-0 text-white hover:bg-gray-900"
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-m)" />}
            aria-label="Volver"
          />
        }
      />
      <div className="flex flex-1 items-center justify-center rounded-[1.5rem] bg-gray-50 p-(--size-m)">
      </div>
    </div>
  );
}
