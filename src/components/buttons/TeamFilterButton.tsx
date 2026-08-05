import type { ReactNode } from 'react';
import HideButton from './HideButton';
import ViewMemberButton from './ViewMemberButton';

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
      <ViewMemberButton
        label={option.label}
        className="w-full justify-between"
        onOpen={onOpenDetails}
      />
    </>
  );
}
