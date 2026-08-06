import { ChevronLeft } from 'lucide-react';
import FormAddService from '../widgets/serviceWidgets/FormAddService';
import MainContent from '../layout/MainContent';
import Button from '../interface/Button';
import MainHeader from '../interface/MainHeader';

export const ADD_SERVICE_VIEW_TITLE = 'Agregar un nuevo servicio';

type ServiceViewMode = 'create' | 'view' | 'edit';

interface AddServiceViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
  mode?: ServiceViewMode;
}

export default function AddServiceView({
  open = true,
  onClose,
  title = ADD_SERVICE_VIEW_TITLE,
  onBack,
  mode = 'create',
}: AddServiceViewProps) {
  if (!open) return null;

  const handleBack = onBack ?? onClose;
  const handleCancel = handleBack;
  const handleConfirm = onClose ?? onBack;
  const actionLabel = mode === 'edit' ? 'Guardar' : mode === 'view' ? 'Editar' : 'Confirmar';
  const cancelLabel = mode === 'view' ? 'Volver' : 'Cancelar';

  return (
    <MainContent>
      <MainHeader
        title={title}
        action={
          <Button
            className="h-(--size-2xl) w-(--size-2xl) p-0 text-neutral-900 bg-transparent"
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <FormAddService />
      </div>
      <div className="flex justify-end gap-3 pt-(--size-m)">
        <Button className="px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-50 text-neutral-900" onClick={handleCancel} text={cancelLabel} />
        <Button className="px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-900 text-white" onClick={handleConfirm} text={actionLabel} />
      </div>
    </MainContent>
  );
}
