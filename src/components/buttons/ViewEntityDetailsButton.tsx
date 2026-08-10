import { useState, type ReactNode } from 'react';
import DetailsButton from './DetailsButton';

/*
  src/components/buttons/ViewEntityDetailsButton.tsx
  Botón "Ver detalles de X" genérico: reemplaza a ViewClientButton/
  ViewEntityButton/ViewServiceButton, que eran copias idénticas salvo por qué
  View renderizaban y el texto del trigger. Mismo patrón controlado/no
  controlado que AddEntityLauncherButton.
*/

interface ViewEntityDetailsButtonProps {
  className?: string;
  onOpen?: () => void;
  triggerText?: string;
  renderView: (props: { open: boolean; onClose: () => void }) => ReactNode;
}

export default function ViewEntityDetailsButton({
  className,
  onOpen,
  triggerText = 'Detalles',
  renderView,
}: ViewEntityDetailsButtonProps) {
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
      <DetailsButton text={triggerText} className={className} onClick={handleOpen} />
      {!onOpen && renderView({ open: isOpen, onClose: () => setIsOpen(false) })}
    </>
  );
}
