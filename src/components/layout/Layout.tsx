/* 
  src/components/Layout.tsx
  Es el layout principal de la aplicación, todo está dentro de este componente.
*/

import { twMerge } from 'tailwind-merge';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  withSidebar?: boolean;
  withSidebar2?: boolean;
  sidebar2Title?: string;
  sidebar2Subtitle?: string;
  sidebar2Action?: React.ReactNode;
  sidebar2Content?: React.ReactNode;
}

/* LayoutClasses: contenedor raíz */
const LayoutClasses = {
  required: 'h-dvh w-dvw overflow-hidden flex flex-col',
  style: 'bg-stone-950',
};

/* LayoutContentClasses: contenedor del contenido */
const LayoutContentClasses = {
  required: 'flex flex-1 overflow-hidden',
  style: '',
};

export default function Layout({
  children,
  withSidebar = false,
  withSidebar2 = false,
  sidebar2Title,
  sidebar2Subtitle,
  sidebar2Action,
  sidebar2Content,
}: LayoutProps) {
  return (
    <div className={twMerge(LayoutClasses.required, LayoutClasses.style)}>
      <div className={twMerge(LayoutContentClasses.required, LayoutContentClasses.style)}>
        {(withSidebar || withSidebar2) && (
          <Sidebar
            withNav={withSidebar}
            withActions={withSidebar2}
            title={sidebar2Title}
            subtitle={sidebar2Subtitle}
            action={sidebar2Action}
          >
            {sidebar2Content}
          </Sidebar>
        )}
        {children}
      </div>
    </div>
  );
}