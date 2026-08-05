import { useState } from 'react';
import AddButton from './AddButton';
import AddEntityView from '../views/AddEntityView';

interface AddEntityButtonProps {
  onOpen?: () => void;
}

export default function AddEntityButton({ onOpen }: AddEntityButtonProps) {
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
      <AddButton text="Agregar miembro" onClick={handleOpen} />

      {!onOpen && (
        <AddEntityView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Agregar miembro"
        />
      )}
    </>
  );
}
