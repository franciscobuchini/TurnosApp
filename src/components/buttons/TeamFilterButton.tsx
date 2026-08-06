import type { ReactNode } from 'react';
import HideButton from './HideButton';
import ViewEntityButton from './ViewEntityButton';

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
      <ViewEntityButton
        label={option.label}
        className={TEAM_FILTER_BUTTON_CLASS}
        onOpen={onOpenDetails}
      />
    </>
  );
}
