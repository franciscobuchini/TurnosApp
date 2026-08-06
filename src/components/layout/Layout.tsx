/* 
  src/components/layout/Layout.tsx
  Layout principal de la aplicación. Sidebar + MainContent ya armados; children = contenido de MainContent.
*/

import Sidebar from './Sidebar';
import MainContent from './MainContent';

interface LayoutProps {
  children: React.ReactNode;
  sidebarChildren?: React.ReactNode;
  sidebarClassName?: string;
  mainContentClassName?: string;
}

const LAYOUT_CLASS = 'h-dvh w-dvw overflow-hidden flex flex-col p-(--size-xs) bg-black';

const LAYOUT_CONTENT_CLASS = 'flex flex-1 min-h-0 overflow-hidden';

export default function Layout({
  children,
  sidebarChildren,
  sidebarClassName,
  mainContentClassName,
}: LayoutProps) {
  return (
    <div className={LAYOUT_CLASS}>
      <div className={LAYOUT_CONTENT_CLASS}>
        <Sidebar className={sidebarClassName}>{sidebarChildren}</Sidebar>
        <MainContent className={mainContentClassName}>{children}</MainContent>
      </div>
    </div>
  );
}
