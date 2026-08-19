/*
  src/components/layout/Sidebar.tsx
  Sidebar: panel de contenido (children libres), con scroll propio.

  En pc, Layout.tsx le da padding vertical (p-3) a toda la fila (menubar/
  sidebar/main), pero acá ese padding queda cancelado con -my-3 para que
  la sidebar ocupe el alto completo — si no, al scrollear el contenido
  queda cortado justo en el borde del padding, que es fijo y no se mueve
  con el scroll. El respiro se recupera adentro, en el propio contenedor
  con scroll (py-3), para que sí viaje con el contenido.

  En mobile (ver useLayoutTier) esta sidebar ya no vive en esa fila —
  Layout.tsx deja de renderizarla ahí, y en su lugar AppMenubar.tsx la
  embebe dentro de su propio menú a pantalla completa (mismo <Sidebar>,
  mismo contenido, sin duplicar nada) — por eso ancho y -my-3, pensados
  para esa fila de pc, no aplican: ahí pasa a ser flex-1 (llena el alto
  que le da el wrapper de AppMenubar) y w-full en vez de w-90.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '@/hooks/useFiltersGroup';
import { useLayoutTier } from '@/hooks/useLayoutTier';

interface SidebarProps {
  children?: ReactNode;
  className?: string;
  footer?: ReactNode;
  expandOpenPanel?: boolean;
}

const SIDEBAR_CLASS = 'flex flex-col min-w-0 shrink-0';
const SIDEBAR_PC_CLASS = 'w-90 -my-3';
const SIDEBAR_MOBILE_CLASS = 'w-full flex-1 min-h-0';

const SIDEBAR_INNER_CLASS = 'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&:has([data-filter-panel][open])>[data-sidebar-title]]:hidden';
const SIDEBAR_EXPAND_OPEN_PANEL_CLASS =
  '[&:has([data-filter-panel][open])>[data-calendar]]:hidden [&:has([data-filter-panel][open])>[data-filter-panel]:not([open])]:hidden [&:has([data-filter-panel][open])>[data-filter-panel][open]]:flex [&:has([data-filter-panel][open])>[data-filter-panel][open]]:min-h-0 [&:has([data-filter-panel][open])>[data-filter-panel][open]]:flex-1 [&:has([data-filter-panel][open])>[data-filter-panel][open]]:shrink [&:has([data-filter-panel][open])>[data-filter-panel][open]]:flex-col';

export default function Sidebar({ children, className, footer, expandOpenPanel = false }: SidebarProps) {
  const tier = useLayoutTier();

  return (
    <aside className={twMerge(SIDEBAR_CLASS, tier === 'mobile' ? SIDEBAR_MOBILE_CLASS : SIDEBAR_PC_CLASS, className)}>
      <div className={twMerge(SIDEBAR_INNER_CLASS, expandOpenPanel && SIDEBAR_EXPAND_OPEN_PANEL_CLASS)}>
        <FiltersGroupProvider value="sidebar">{children}</FiltersGroupProvider>
        {/* El footer vive dentro del scroll (no fijo): con contenido corto
            queda pegado abajo (mt-auto) y, si el contenido crece, viaja con
            el scroll en vez de taparlo. */}
        {footer && <div className="mt-auto shrink-0">{footer}</div>}
      </div>
    </aside>
  );
}
