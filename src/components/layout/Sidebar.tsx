/* 
  src/components/layout/Sidebar.tsx
  Sidebar: barra de navegación con íconos (nav, fija) + panel de contenido (children libres).
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '../../functions/filtersGroupContext';

interface SidebarProps {
  children?: ReactNode;
  className?: string;
}

/* SidebarClasses: envuelve SidebarNav y SidebarContent para que ambos
   se comporten como un solo item flex dentro de Layout. */
const SidebarClasses = {
  required: 'flex flex-col h-full min-w-0 shrink-0 gap-(--size-m) p-(--size-m) w-lg overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
  style: '',
};

export default function Sidebar({ children, className }: SidebarProps) {
  return (
      <aside className={twMerge(SidebarClasses.required, SidebarClasses.style, className)}>
        <FiltersGroupProvider value="sidebar">{children}</FiltersGroupProvider>
      </aside>
  );
}