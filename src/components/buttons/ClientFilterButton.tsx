import type { ReactNode } from 'react';
import ViewClientButton from './ViewClientButton';

const CLIENT_FILTER_BUTTON_CLASS = 'w-full justify-between';

interface ClientFilterButtonProps {
  option: {
    id: string;
    label: string;
    checked?: boolean;
    disabled?: boolean;
  };
  onOpenDetails?: () => void;
  className?: string;
}

export default function ClientFilterButton({ option, onOpenDetails, className }: ClientFilterButtonProps): ReactNode {
  return (
    <ViewClientButton
      label={option.label}
      className={className ?? CLIENT_FILTER_BUTTON_CLASS}
      onOpen={onOpenDetails}
    />
  );
}
