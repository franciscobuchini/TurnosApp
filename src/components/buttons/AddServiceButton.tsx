import { useState } from 'react';
import AddButton from './AddButton';
import AddServiceView from '../views/AddServiceView';

interface AddServiceButtonProps {
  onOpen?: () => void;
}

export default function AddServiceButton({ onOpen }: AddServiceButtonProps) {
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
      <AddButton text="Agregar servicio" onClick={handleOpen} />

      {!onOpen && (
        <AddServiceView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Agregar servicio"
        />
      )}
    </>
  );
}
