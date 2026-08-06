/* 
  src/components/layout/Layout.tsx
  Layout principal de la aplicación. Arma el Sidebar y reserva el espacio del área principal.
  Cada vista es responsable de envolver su propio contenido en <MainContent>.
*/

import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  sidebarChildren?: React.ReactNode;
  sidebarClassName?: string;
}

const LAYOUT_CLASS = 'h-dvh w-dvw overflow-hidden flex flex-col p-(--size-xs) bg-black';

const LAYOUT_CONTENT_CLASS = 'flex flex-1 overflow-hidden';

// Reserva el espacio del área principal (mismo layout que ocupaba MainContent,
// sin sus estilos visuales: eso ahora lo aporta cada vista).
const MAIN_AREA_CLASS = 'flex flex-1 min-h-0 min-w-0 h-full w-full';

export default function Layout({ children, sidebarChildren, sidebarClassName }: LayoutProps) {
  return (
    <div className={LAYOUT_CLASS}>
      <div className={LAYOUT_CONTENT_CLASS}>
        <Sidebar className={sidebarClassName}>{sidebarChildren}</Sidebar>
        <div className={MAIN_AREA_CLASS}>{children}</div>
      </div>
    </div>
  );
}