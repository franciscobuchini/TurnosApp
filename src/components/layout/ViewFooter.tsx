import CancelButton from '../buttons/CancelButton';
import ConfirmButton from '../buttons/ConfirmButton';
import DeleteButton from '../buttons/DeleteButton';

/*
  src/components/layout/ViewFooter.tsx
  Fila de acciones del footer, compartida por todas las vistas que usan
  ViewLayout: antes cada vista armaba a mano el mismo trío Cancelar/Confirmar
  (+ Eliminar opcional), acá vive una sola vez.
*/

interface ViewFooterProps {
  cancelText?: string;
  onCancel: () => void;
  confirmText?: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  onDelete?: () => void;
  deleteText?: string;
}

export default function ViewFooter({
  cancelText = 'Cancelar',
  onCancel,
  confirmText = 'Confirmar',
  onConfirm,
  confirmDisabled,
  onDelete,
  deleteText = 'Eliminar',
}: ViewFooterProps) {
  return (
    <>
      {onDelete ? <DeleteButton className="mr-auto" onClick={onDelete} text={deleteText} /> : null}
      <CancelButton onClick={onCancel} text={cancelText} />
      <ConfirmButton onClick={onConfirm} text={confirmText} disabled={confirmDisabled} />
    </>
  );
}
