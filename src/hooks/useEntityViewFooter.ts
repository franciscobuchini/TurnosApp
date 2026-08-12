/*
  src/hooks/useEntityViewFooter.ts
  Glue común entre ClientView y ServiceView: los labels de Cancelar/Confirmar
  según el modo (create/view/edit) y el handler de "Cancelar" (delega a
  onCancel si se pasó, si no vuelve atrás). EntityView (miembro) queda afuera
  a propósito: su `mode` es solo 'create'|'view' — "editar" es un estado
  local efímero, sin ruta propia como servicio/cliente, así que forzarlo acá
  implicaría simular un mode==='edit' que nunca coincide con la URL real.
*/

export type EntityViewMode = 'create' | 'view' | 'edit';

interface UseEntityViewFooterParams {
  mode: EntityViewMode;
  isFormValid: boolean;
  onBack?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
}

interface UseEntityViewFooterResult {
  actionLabel: string;
  cancelLabel: string;
  isConfirmDisabled: boolean;
  handleCancel: () => void;
}

export function useEntityViewFooter({
  mode,
  isFormValid,
  onBack,
  onClose,
  onCancel,
}: UseEntityViewFooterParams): UseEntityViewFooterResult {
  const handleBack = onBack ?? onClose;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    handleBack?.();
  };

  const actionLabel = mode === 'edit' ? 'Guardar' : mode === 'view' ? 'Editar' : 'Confirmar';
  const cancelLabel = mode === 'view' ? 'Volver' : 'Cancelar';
  const isConfirmDisabled = mode === 'create' && !isFormValid;

  return { actionLabel, cancelLabel, isConfirmDisabled, handleCancel };
}
