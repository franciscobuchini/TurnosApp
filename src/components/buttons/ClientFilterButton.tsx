import type { ReactNode } from 'react';
import HideButton from './HideButton';
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
    <>
      <HideButton className={className ?? CLIENT_FILTER_BUTTON_CLASS} />
      <ViewClientButton
        label={option.label}
        className={CLIENT_FILTER_BUTTON_CLASS}
        onOpen={onOpenDetails}
      />
    </>
  );
}
