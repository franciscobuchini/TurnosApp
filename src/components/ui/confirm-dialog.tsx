/*
  src/components/ui/confirm-dialog.tsx
  Diálogo de confirmación para acciones que no se pueden deshacer (eliminar,
  descartar cambios sin guardar, etc.) — compartido por EditAppointmentSidebar
  (cancelar turno / descartar edición) y por el botón "Eliminar" del footer
  de ViewLayout (Miembro/Servicio/Cliente).

  Opcionalmente, si `requirePin` es true, muestra un campo de PIN de
  administrador y no habilita la acción hasta que coincida con el
  `adminPin` del negocio (business).
*/

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { getBusiness } from '@/database/data';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
  /** Si es true, pide el PIN de administrador antes de habilitar la acción. */
  requirePin?: boolean;
}

export default function ConfirmDialog({ open, onOpenChange, title, description, confirmText, onConfirm, requirePin = false }: ConfirmDialogProps) {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  /* Resetear el PIN cada vez que se abre/cierra el dialog. */
  useEffect(() => {
    if (!open) {
      setPin('');
      setPinError(false);
    }
  }, [open]);

  const handlePinChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPin(digits);
    setPinError(false);
  };

  const handleConfirm = () => {
    if (requirePin) {
      const business = getBusiness();
      if (pin !== business.adminPin) {
        setPinError(true);
        return;
      }
    }
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {requirePin && (
          <div className="py-1">
            <Input
              label="PIN de administrador"
              type="password"
              inputMode="numeric"
              placeholder="0000"
              maxLength={4}
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              inputClassName={pinError ? 'border-destructive' : undefined}
            />
            {pinError && (
              <p className="mt-1.5 text-xs text-destructive">PIN incorrecto</p>
            )}
          </div>
        )}

        <DialogFooter>
          <CancelButton text="Volver" onClick={() => onOpenChange(false)} />
          <DeleteButton
            text={confirmText}
            disabled={requirePin && pin.length < 4}
            onClick={handleConfirm}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
