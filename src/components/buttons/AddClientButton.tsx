import { useState } from 'react';
import AddButton from './AddButton';
import AddClientView from '../views/AddClientView';

interface AddClientButtonProps {
  onOpen?: () => void;
}

export default function AddClientButton({ onOpen }: AddClientButtonProps) {
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
      <AddButton text="Agregar cliente" onClick={handleOpen} />

      {!onOpen && (
        <AddClientView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Agregar cliente"
        />
      )}
    </>
  );
}
