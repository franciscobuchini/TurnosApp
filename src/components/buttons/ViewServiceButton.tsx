import { useState } from 'react';
import DetailsButton from './DetailsButton';
import ViewServiceView from '../views/serviceViews/DetailsServiceView';

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
        <ViewServiceView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title={`Detalles de ${label}`}
        />
      )}
    </>
  );
}
