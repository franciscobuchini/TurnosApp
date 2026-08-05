import { useState } from 'react';
import DetailsButton from './DetailsButton';
import ViewClientView from '../views/clientViews/DetailsClientView';

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
        <ViewClientView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title={`Detalles de ${label}`}
        />
      )}
    </>
  );
}
