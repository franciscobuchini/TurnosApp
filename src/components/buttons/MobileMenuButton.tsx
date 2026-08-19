/*
  src/components/buttons/MobileMenuButton.tsx
  Botón "Abrir menú" del menú mobile (ver useLayoutTier) — el mismo botón
  se usa en dos lugares con distinto posicionamiento, así que vive acá en
  vez de duplicarse:
  - AppMenubar.tsx: flotante (fixed), en toda página excepto /admin.
  - ScheduleView.tsx: embebido en la fila de WeekSelector, "compartiendo
    espacio" con él y con el avatar del empleado — sólo en /admin.
  El estado de si el menú está abierto vive en Dashboard.tsx (ver
  mobileMenuOpen ahí) porque los dos lugares necesitan poder abrirlo.
*/

import { Menu } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

const ICON_CLASS = 'size-5';

const MOBILE_MENU_BUTTON_CLASS = 'size-12 shrink-0 rounded-full shadow-lg';

interface MobileMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export default function MobileMenuButton({ onClick, className }: MobileMenuButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="default"
      size="icon-lg"
      icon={<Menu className={ICON_CLASS} />}
      aria-label="Abrir menú"
      title="Abrir menú"
      className={twMerge(MOBILE_MENU_BUTTON_CLASS, className)}
    />
  );
}
