import { useState } from 'react';
import AddButton from './AddButton';
import AddClientView, { ADD_CLIENT_VIEW_TITLE } from '../views/ClientView';

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
      <AddButton text={ADD_CLIENT_VIEW_TITLE} onClick={handleOpen} />

      {!onOpen && (
        <AddClientView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title={ADD_CLIENT_VIEW_TITLE}
        />
      )}
    </>
  );
}
