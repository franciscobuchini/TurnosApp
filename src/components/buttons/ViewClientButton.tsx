import { useState } from 'react';
import DetailsButton from './DetailsButton';
import ClientView from '../views/ClientView';

interface ViewClientButtonProps {
  label: string;
  className?: string;
  onOpen?: () => void;
}

export default function ViewClientButton({ label, className, onOpen }: ViewClientButtonProps) {
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
        <ClientView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title={`Detalles de ${label}`}
          mode="view"
          clientName={label}
        />
      )}
    </>
  );
}
