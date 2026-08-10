import type { ReactNode } from 'react';
import { PowerOff, Power } from 'lucide-react';
import HideButton from './HideButton';
import ViewEntityDetailsButton from './ViewEntityDetailsButton';
import ServiceView from '@/components/views/ServiceView';

const SERVICE_FILTER_BUTTON_CLASS = 'w-full justify-between';

interface ServiceFilterButtonProps {
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

export default function ServiceFilterButton({ option, onToggle, onOpenDetails, className }: ServiceFilterButtonProps): ReactNode {
  return (
    <>
      <HideButton
        visible={option.checked ?? true}
        onToggle={(visible) => onToggle?.(option.id, visible)}
        activeText="Desactivar"
        inactiveText="Activar"
        icon={option.checked === false ? <Power size={16} /> : <PowerOff size={16} />}
        className={className ?? SERVICE_FILTER_BUTTON_CLASS}
      />
      <ViewEntityDetailsButton
        className={SERVICE_FILTER_BUTTON_CLASS}
        onOpen={onOpenDetails}
        renderView={({ open, onClose }) => (
          <ServiceView
            open={open}
            onClose={onClose}
            title={`Detalles de ${option.label}`}
            mode="view"
            serviceName={option.label}
          />
        )}
      />
    </>
  );
}
