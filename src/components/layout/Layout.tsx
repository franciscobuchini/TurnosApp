/*
  src/components/layout/Layout.tsx
  Layout principal de la aplicación. Arma la estructura y reserva el espacio del área principal.
  Cada vista es responsable de envolver su propio contenido en <MainContent>.
*/

import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

const LAYOUT_CONTENT_CLASS = 'h-dvh w-dvw flex flex-1 overflow-hidden p-3 gap-4';

const MAIN_AREA_CLASS = 'flex flex-1 min-h-0 min-w-0 h-full w-full';

export default function Layout({ children, sidebar }: LayoutProps) {
  return (
      <div className={LAYOUT_CONTENT_CLASS}>
        {sidebar}
        <div className={MAIN_AREA_CLASS}>{children}</div>
      </div>
  );
}