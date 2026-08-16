/*
  src/components/ui/confirm-dialog.tsx
  Diálogo de confirmación para acciones que no se pueden deshacer (eliminar,
  descartar cambios sin guardar, etc.) — compartido por EditAppointmentSidebar
  (cancelar turno / descartar edición) y por el botón "Eliminar" del footer
  de ViewLayout (Miembro/Servicio/Cliente).
*/

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import CancelButton from '@/components/buttons/CancelButton';
import DeleteButton from '@/components/buttons/DeleteButton';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
}

export default function ConfirmDialog({ open, onOpenChange, title, description, confirmText, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <CancelButton text="Volver" onClick={() => onOpenChange(false)} />
          <DeleteButton
            text={confirmText}
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
