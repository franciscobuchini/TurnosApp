import type { ReactNode } from 'react';
import MainContent from '../layout/MainContent';
import MainHeader from '@/components/ui/main-header';
import BackButton from '../buttons/BackButton';
import ViewFooter from './ViewFooter';

/*
  src/components/layout/ViewLayout.tsx
  Shell de dos columnas (left/right) + footer, compartido por todas las
  vistas salvo Schedule (que es de una sola columna). El footer ya no se
  arma a mano en cada vista: ViewLayout recibe los props de acción y
  renderiza siempre el mismo ViewFooter.
*/

interface ViewLayoutProps {
  title: string;
  left: ReactNode;
  right: ReactNode;
  onBack?: () => void;
  cancelText?: string;
  onCancel: () => void;
  confirmText?: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  onDelete?: () => void;
  deleteText?: string;
}

const VIEW_LAYOUT_CLASS =
  'flex min-h-0 w-full flex-1 flex-col p-3 gap-3';

const VIEW_COLUMNS_CLASS =
  'relative flex h-full w-full flex-1 flex-row gap-6';

const VIEW_LEFT_COLUMN_CLASS =
  'flex min-h-0 w-full flex-1';

const VIEW_RIGHT_COLUMN_CLASS =
  'flex min-h-0 w-full flex-1';

const VIEW_FOOTER_CLASS =
  'flex justify-end gap-2 p-3 bg-card z-10';

export default function ViewLayout({
  title,
  left,
  right,
  onBack,
  cancelText,
  onCancel,
  confirmText,
  onConfirm,
  confirmDisabled,
  onDelete,
  deleteText,
}: ViewLayoutProps) {
  return (
    <MainContent>
      <MainHeader
        title={title}
        action={onBack ? <BackButton onClick={onBack} /> : undefined}
      />

      <div className={VIEW_LAYOUT_CLASS}>
        <div className={VIEW_COLUMNS_CLASS}>
          <div className={VIEW_LEFT_COLUMN_CLASS}>
            {left}
          </div>

          <div className={VIEW_RIGHT_COLUMN_CLASS}>
            {right}
          </div>
        </div>
      </div>

      <div className={VIEW_FOOTER_CLASS}>
        <ViewFooter
          cancelText={cancelText}
          onCancel={onCancel}
          confirmText={confirmText}
          onConfirm={onConfirm}
          confirmDisabled={confirmDisabled}
          onDelete={onDelete}
          deleteText={deleteText}
        />
      </div>
    </MainContent>
  );
}
