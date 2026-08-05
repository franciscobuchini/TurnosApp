import { useState } from 'react';
import AddButton from './AddButton';
import AddEntityView, { ADD_ENTITY_VIEW_TITLE } from '../views/entityViews/AddEntityView';

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
      <AddButton text={ADD_ENTITY_VIEW_TITLE} onClick={handleOpen} />

      {!onOpen && (
        <AddEntityView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title={ADD_ENTITY_VIEW_TITLE}
        />
      )}
    </>
  );
}
