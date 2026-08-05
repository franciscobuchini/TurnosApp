import { useState } from 'react';
import DetailsButton from './DetailsButton';
import ViewEntityView from '../views/entityViews/DetailsEntityView';

interface ViewEntityButtonProps {
  label: string;
  className?: string;
  onOpen?: () => void;
}

export default function ViewEntityButton({ label, className, onOpen }: ViewEntityButtonProps) {
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
        text="Ver perfil"
        className={className}
        onClick={handleOpen}
      />

      {!onOpen && (
        <ViewEntityView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title={`Perfil de ${label}`}
        />
      )}
    </>
  );
}
