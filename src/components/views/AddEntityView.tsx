import { ArrowLeft } from 'lucide-react';
import Button from '../interface/Button';
import MainHeader from '../widgets/MainHeader';

interface AddEntityViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}

export default function AddEntityView({
  open = true,
  onClose,
  title = 'Agregar miembro',
  description = 'Aquí iría el formulario para agregar un miembro.',
  onBack,
}: AddEntityViewProps) {
  if (!open) return null;

  const handleBack = onBack ?? onClose;
  return (
    <div className="flex h-full w-full flex-col gap-(--size-m) text-white">
      <MainHeader
        title={title}
        action={
          <Button
            className="h-(--size-xl) w-(--size-xl) rounded-full bg-stone-800 p-0 text-white hover:bg-stone-700"
            onClick={handleBack}
            icon={<ArrowLeft size="var(--size-m)" />}
            aria-label="Volver"
          />
        }
      />
      <div className="flex flex-1 items-center justify-center rounded-[1.5rem] bg-stone-800/70 p-(--size-m)">
        <p className="text-lg text-stone-300">{description}</p>
      </div>
    </div>
  );
}
