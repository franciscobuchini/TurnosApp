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

  El trigger es el logo (la nube) en vez de un ícono de hamburguesa: en
  cualquier vista, tocar la nube abre el menú.
*/

import { twMerge } from 'tailwind-merge';
import Logo from '@/components/ui/logo';

const MOBILE_MENU_BUTTON_CLASS =
  'flex size-12 shrink-0 items-center justify-center transition-transform active:scale-[0.97] cursor-pointer';

interface MobileMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export default function MobileMenuButton({ onClick, className }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir menú"
      title="Abrir menú"
      className={twMerge(MOBILE_MENU_BUTTON_CLASS, className)}
    >
      <Logo className="h-full w-auto drop-shadow-md" />
    </button>
  );
}
