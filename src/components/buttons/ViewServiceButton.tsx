import { useState } from 'react';
import DetailsButton from './DetailsButton';
import ServiceView from '../views/ServiceView';

interface ViewServiceButtonProps {
  label: string;
  className?: string;
  onOpen?: () => void;
}

export default function ViewServiceButton({ label, className, onOpen }: ViewServiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
      return;
    }

    setIsOpen(true);
  };

  return (
    <>
      <DetailsButton
        text="Detalles"
        className={className}
        onClick={handleOpen}
      />

      {!onOpen && (
        <ServiceView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title={`Detalles de ${label}`}
          mode="view"
          serviceName={label}
        />
      )}
    </>
  );
}
