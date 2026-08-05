import type { ReactNode } from 'react';
import { PowerOff, Power } from 'lucide-react';
import HideButton from './HideButton';
import ViewServiceButton from './ViewServiceButton';

interface ServiceFilterButtonProps {
  option: {
    id: string;
    label: string;
    checked?: boolean;
    disabled?: boolean;
  };
  onOpenDetails?: () => void;
  className?: string;
}

export default function ServiceFilterButton({ option, onOpenDetails, className }: ServiceFilterButtonProps): ReactNode {
  return (
    <>
      <HideButton
        visible={option.checked ?? true}
        activeText="Desactivar"
        inactiveText="Activar"
        icon={option.checked === false ? <PowerOff size="var(--size-m)" /> : <Power size="var(--size-m)" />}
        className={className ?? 'w-full justify-between'}
      />
      <ViewServiceButton
        label={option.label}
        className="w-full justify-between"
        onOpen={onOpenDetails}
      />
    </>
  );
}
