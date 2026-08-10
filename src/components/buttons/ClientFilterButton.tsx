import type { ReactNode } from 'react';
import ViewEntityDetailsButton from './ViewEntityDetailsButton';
import AddClientView from '@/components/views/ClientView';

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
    <ViewEntityDetailsButton
      className={className ?? CLIENT_FILTER_BUTTON_CLASS}
      onOpen={onOpenDetails}
      renderView={({ open, onClose }) => (
        <AddClientView
          open={open}
          onClose={onClose}
          title={`Detalles de ${option.label}`}
          mode="view"
          clientName={option.label}
        />
      )}
    />
  );
}
