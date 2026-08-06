import { ChevronLeft } from 'lucide-react';
import MainContent from '../../layout/MainContent';
import Button from '../../interface/Button';
import MainHeader from '../../interface/MainHeader';
import FormAddEntity from '../../widgets/entityWidgets/FormAddEntity';

export const ADD_ENTITY_VIEW_TITLE = 'Agregar un nuevo miembro';

interface AddEntityViewProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onBack?: () => void;
}

const ADD_ENTITY_BACK_BUTTON_CLASS = 'h-(--size-2xl) w-(--size-2xl) p-0 text-neutral-900 bg-transparent';

const ADD_ENTITY_FOOTER_BUTTON_CANCEL_CLASS = 'px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-50 text-neutral-900';
const ADD_ENTITY_FOOTER_BUTTON_CONFIRM_CLASS = 'px-(--size-l) py-(--size-s) rounded-2xl bg-neutral-900 text-white';

const ADD_ENTITY_FOOTER_CLASS = 'flex justify-end gap-3 pt-(--size-m)';

const ADD_ENTITY_CONTENT_CLASS = 'grid min-h-0 flex-1 grid-cols-1 gap-(--size-m) rounded-3xl bg-neutral-50 p-(--size-m) lg:grid-cols-2';
const ADD_ENTITY_FORM_COLUMN_CLASS = 'flex min-h-0 flex-col justify-center';
const ADD_ENTITY_ASIDE_COLUMN_CLASS = 'min-h-0 rounded-3xl';

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
    <MainContent>
      <MainHeader
        title={title}
        action={
          <Button
            className={ADD_ENTITY_BACK_BUTTON_CLASS}
            onClick={handleBack}
            icon={<ChevronLeft size="var(--size-l)" />}
            aria-label="Volver"
          />
        }
      />
      <div className={ADD_ENTITY_CONTENT_CLASS}>
        <div className={ADD_ENTITY_FORM_COLUMN_CLASS}>
          <FormAddEntity />
        </div>
        <div className={ADD_ENTITY_ASIDE_COLUMN_CLASS} />
      </div>
      <div className={ADD_ENTITY_FOOTER_CLASS}>
        <Button
          className={ADD_ENTITY_FOOTER_BUTTON_CANCEL_CLASS}
          onClick={handleCancel}
          text="Cancelar"
        />
        <Button
          className={ADD_ENTITY_FOOTER_BUTTON_CONFIRM_CLASS}
          onClick={handleConfirm}
          text="Confirmar"
        />
      </div>
    </MainContent>
  );
}
