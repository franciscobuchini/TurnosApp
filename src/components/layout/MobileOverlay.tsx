/*
  src/components/layout/MobileOverlay.tsx
  Cáscara compartida del menú a pantalla completa en mobile (ver
  useLayoutTier): fondo sólido, mismo header (logo + botón "Cerrar") en
  los dos lugares que la usan —
  - AppMenubar.tsx: el menú de navegación (Inicio/Notificaciones/etc, y
    la sidebar de la página activa cuando corresponde).
  - WeekSelector.tsx: el calendario completo, al tocar un día del
    selector de semana.
  Queda acá (no adentro de AppMenubar) para que las dos versiones se
  vean exactamente iguales sin duplicar el header a mano en cada lugar.
*/

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';

const MOBILE_OVERLAY_CLASS = 'fixed inset-0 z-50 flex flex-col gap-1 overflow-y-auto bg-background p-4';

const MOBILE_OVERLAY_HEADER_CLASS = 'mb-2 flex shrink-0 items-center justify-between px-2';

const ICON_CLASS = 'size-5';

interface MobileOverlayProps {
  onClose: () => void;
  children: ReactNode;
}

export default function MobileOverlay({ onClose, children }: MobileOverlayProps) {
  return (
    <div className={MOBILE_OVERLAY_CLASS}>
      <div className={MOBILE_OVERLAY_HEADER_CLASS}>
        <Logo className="h-12 w-auto shrink-0" />
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon-lg"
          icon={<X className={ICON_CLASS} />}
          aria-label="Cerrar menú"
          title="Cerrar menú"
        />
      </div>

      {children}
    </div>
  );
}
