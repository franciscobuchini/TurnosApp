import type { ReactNode } from 'react';
import HideButton from './HideButton';
import ViewEntityDetailsButton from './ViewEntityDetailsButton';
import AddEntityView from '@/components/views/EntityView';

const TEAM_FILTER_BUTTON_CLASS = 'w-full justify-between';

interface TeamFilterButtonProps {
  option: {
    id: string;
    label: string;
    checked?: boolean;
    disabled?: boolean;
  };
  onToggle?: (id: string, checked: boolean) => void;
  onOpenDetails?: () => void;
  className?: string;
}

export default function TeamFilterButton({ option, onToggle, onOpenDetails, className }: TeamFilterButtonProps): ReactNode {
  return (
    <>
      <HideButton
        visible={option.checked ?? true}
        onToggle={(visible) => onToggle?.(option.id, visible)}
        className={className}
      />
      <ViewEntityDetailsButton
        triggerText="Ver perfil"
        className={TEAM_FILTER_BUTTON_CLASS}
        onOpen={onOpenDetails}
        renderView={({ open, onClose }) => (
          <AddEntityView
            open={open}
            onClose={onClose}
            title={`Perfil de ${option.label}`}
            mode="view"
            memberName={option.label}
          />
        )}
      />
    </>
  );
}
