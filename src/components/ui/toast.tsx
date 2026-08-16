/*
  src/components/ui/toast.tsx
  Notificación flotante simple, sin cola (un mensaje a la vez): se monta al
  recibir `message` y se autodesmonta sola (o con la X). No hay un sistema
  de notificaciones global en la app todavía — este componente cubre el
  primer caso de uso ("Agregar turno" sin disponibilidad en los próximos
  días) sin necesidad de un provider/contexto nuevo.
*/

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
}

const TOAST_CLASS =
  'fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-sm text-foreground shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-200';

export default function Toast({ message, onDismiss, durationMs = 6000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  return (
    <div role="status" className={TOAST_CLASS}>
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <X size={14} />
      </button>
    </div>
  );
}
