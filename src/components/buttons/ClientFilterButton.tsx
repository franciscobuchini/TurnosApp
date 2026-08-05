import type { ReactNode } from 'react';
import HideButton from './HideButton';
import ViewClientButton from './ViewClientButton';

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
      <HideButton className={className ?? 'w-full justify-between'} />
      <ViewClientButton
        label={option.label}
        className="w-full justify-between"
        onOpen={onOpenDetails}
      />
    </>
  );
}
