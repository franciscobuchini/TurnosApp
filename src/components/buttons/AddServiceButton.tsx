import { useState } from 'react';
import AddButton from './AddButton';
import AddServiceView, { ADD_SERVICE_VIEW_TITLE } from '../views/serviceViews/AddServiceView';

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
      <AddButton text={ADD_SERVICE_VIEW_TITLE} onClick={handleOpen} />

      {!onOpen && (
        <AddServiceView
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title={ADD_SERVICE_VIEW_TITLE}
        />
      )}
    </>
  );
}
