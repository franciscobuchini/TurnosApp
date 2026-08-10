import { useState, type ReactNode } from 'react';
import AddButton from './AddButton';

/*
  src/components/buttons/AddEntityLauncherButton.tsx
  Botón "Agregar X" genérico: reemplaza a AddClientButton/AddEntityButton/
  AddServiceButton, que eran copias idénticas salvo por qué View renderizaban.
  Si se pasa onOpen (caso real de uso hoy: navegar a la ruta de creación), se
  delega ahí. Si no, administra su propio estado y abre `renderView` como
  overlay local.
*/

interface AddEntityLauncherButtonProps {
  title: string;
  onOpen?: () => void;
  renderView: (props: { open: boolean; onClose: () => void }) => ReactNode;
}

export default function AddEntityLauncherButton({ title, onOpen, renderView }: AddEntityLauncherButtonProps) {
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
      <AddButton text={title} onClick={handleOpen} />
      {!onOpen && renderView({ open: isOpen, onClose: () => setIsOpen(false) })}
    </>
  );
}
