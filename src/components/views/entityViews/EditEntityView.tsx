import { ChevronLeft } from 'lucide-react';
import MainContent from '../../layout/MainContent';
import Button from '../../interface/Button';
import MainHeader from '../../interface/MainHeader';

interface ViewEntityViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}


const VIEW_ENTITY_BACK_BUTTON_CLASS = 'h-(--size-2xl) w-(--size-2xl) p-0 text-neutral-900 bg-transparent';

const VIEW_ENTITY_FOOTER_BUTTON_CANCEL_CLASS = 'px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-50 text-neutral-900';
const VIEW_ENTITY_FOOTER_BUTTON_CONFIRM_CLASS = 'px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-900 text-white';

const VIEW_ENTITY_FOOTER_CLASS = 'flex justify-end gap-3 pt-(--size-m)';

const VIEW_ENTITY_CONTENT_CLASS = 'flex flex-1 items-center justify-center rounded-3xl bg-neutral-50 p-(--size-m)';

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
    <MainContent>
      <MainHeader
        title={title}
        action={
          <Button
            className={VIEW_ENTITY_BACK_BUTTON_CLASS}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <div className={VIEW_ENTITY_CONTENT_CLASS}>
      </div>
      <div className={VIEW_ENTITY_FOOTER_CLASS}>
        <Button
          className={VIEW_ENTITY_FOOTER_BUTTON_CANCEL_CLASS}
          onClick={handleCancel}
          text="Cancelar"
        />
        <Button
          className={VIEW_ENTITY_FOOTER_BUTTON_CONFIRM_CLASS}
          onClick={handleConfirm}
          text="Confirmar"
        />
      </div>
    </MainContent>
  );
}
