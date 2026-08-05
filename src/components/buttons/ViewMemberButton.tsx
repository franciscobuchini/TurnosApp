import { useState } from 'react';
import DetailsButton from './DetailsButton';
import ViewEntityView from '../views/ViewEntityView';

interface ViewMemberButtonProps {
  label: string;
  className?: string;
  onOpen?: () => void;
}

export default function ViewMemberButton({ label, className, onOpen }: ViewMemberButtonProps) {
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
