/*
  src/components/layout/Layout.tsx
  Layout principal de la aplicación. Arma la estructura y reserva el espacio del área principal.
  Cada vista es responsable de envolver su propio contenido en <MainContent>.

  En mobile (ver useLayoutTier), sidebar deja de renderizarse en esta fila
  (no hay lugar al lado de children/Schedule en una pantalla angosta) —
  AppMenubar.tsx recibe la misma sidebar por prop y la muestra dentro de
  su propio menú a pantalla completa en su lugar, así que quien arma
  <Layout menubar sidebar> (ej. Dashboard.tsx) le pasa el mismo nodo a
  los dos sin duplicar la lógica de qué sidebar corresponde mostrar.
*/

import type { ReactNode } from 'react';
import { useLayoutTier } from '@/hooks/useLayoutTier';

interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  menubar?: ReactNode;
}

const LAYOUT_CONTENT_CLASS = 'h-dvh w-dvw flex flex-1 overflow-hidden md:p-3 gap-4';

const MAIN_AREA_CLASS = 'flex flex-1 min-h-0 min-w-0 h-full w-full';

export default function Layout({ children, sidebar, menubar }: LayoutProps) {
  const tier = useLayoutTier();

  return (
      <div className={LAYOUT_CONTENT_CLASS}>
        {menubar}
        {tier !== 'mobile' && sidebar}
        <div className={MAIN_AREA_CLASS}>{children}</div>
      </div>
  );
}