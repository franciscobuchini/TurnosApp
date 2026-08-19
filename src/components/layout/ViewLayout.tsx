import { type ReactNode, useState } from 'react';
import MainContent from '../layout/MainContent';
import MainHeader from '@/components/ui/main-header';
import ViewFooter from './ViewFooter';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

/*
  src/components/layout/ViewLayout.tsx
  Shell de una sola columna centrada (left y, si hay, right apilados) +
  footer, compartido por todas las vistas salvo Schedule (que arma su
  propio scroll interno). El scroll de todo el contenido pasa por
  MainContent (ver overflow-y-auto ahí); el footer queda `sticky bottom-0`
  para no moverse con ese scroll — el header (MainHeader) sí se va con el
  contenido, a propósito, nadie lo pidió fijo. El footer ya no se arma a
  mano en cada vista: ViewLayout recibe los props de acción y renderiza
  siempre el mismo ViewFooter.

  "Eliminar" (Miembro/Servicio/Cliente) no dispara `onDelete` directo: abre
  primero un ConfirmDialog (mismo componente que ya usaba
  EditAppointmentSidebar para cancelar un turno) y recién si se confirma
  ahí se llama a `onDelete`. "Cancelar"/"Volver" pasa por la guarda global
  de useUnsavedChanges (confirmNavigation) en vez de un dialog propio: la
  vista ya registró su isDirty ahí (ver el useEffect en cada una), así el
  mismo control también protege salir por otro lado (AppMenubar), no sólo
  por este botón.
*/

interface ViewLayoutProps {
  title: string;
  left: ReactNode;
  right?: ReactNode;
  /** Contenido extra al final de la columna, después de left/right (ej. un
      link secundario como "Términos y condiciones"). */
  children?: ReactNode;
  cancelText?: string;
  onCancel: () => void;
  confirmText?: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  onDelete?: () => void;
  deleteText?: string;
}

const VIEW_LAYOUT_CLASS =
  'flex w-full flex-1 flex-col px-16 py-8';

/* Una sola columna, centrada, con un ancho máximo cómodo de leer/completar
   en vez de estirarse borde a borde en pantallas grandes. */
const VIEW_COLUMNS_CLASS =
  'relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10';

const VIEW_FOOTER_CLASS =
  'sticky bottom-0 flex justify-end gap-2 p-3 z-10';

export default function ViewLayout({
  title,
  left,
  right,
  children,
  cancelText,
  onCancel,
  confirmText,
  onConfirm,
  confirmDisabled,
  onDelete,
  deleteText = 'Eliminar',
}: ViewLayoutProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { confirmNavigation } = useUnsavedChanges();

  const handleCancelClick = () => confirmNavigation(onCancel);

  return (
    <MainContent>
      <MainHeader title={title} className="pt-8" />

      <div className={VIEW_LAYOUT_CLASS}>
        <div className={VIEW_COLUMNS_CLASS}>
          {left}
          {right}
          {children}
        </div>
      </div>

      <div className={VIEW_FOOTER_CLASS}>
        <ViewFooter
          cancelText={cancelText}
          onCancel={handleCancelClick}
          confirmText={confirmText}
          onConfirm={onConfirm}
          confirmDisabled={confirmDisabled}
          onDelete={onDelete ? () => setConfirmDeleteOpen(true) : undefined}
          deleteText={deleteText}
        />
      </div>

      {onDelete && (
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title={`¿${deleteText}?`}
          description="Esta acción no se puede deshacer."
          confirmText={deleteText}
          onConfirm={onDelete}
          requirePin
        />
      )}
    </MainContent>
  );
}
