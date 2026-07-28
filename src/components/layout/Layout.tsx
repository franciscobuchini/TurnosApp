/* 
  src/components/Layout.tsx
  Es el layout principal de la aplicación, todo está dentro de este componente.
*/

import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  withSidebar?: boolean;
}

export default function Layout({ children, withSidebar = false }: LayoutProps) {
  return (
    <div className="h-dvh w-dvw overflow-hidden flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {withSidebar && <Sidebar />}
        {children}
      </div>
    </div>
  );
}
