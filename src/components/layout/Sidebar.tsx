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

const SIDEBAR_CLASS = 'flex flex-col h-full min-w-0 shrink-0 gap-(--size-m) p-(--size-m) w-lg overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

export default function Sidebar({ children, className }: SidebarProps) {
  return (
      <aside className={twMerge(SIDEBAR_CLASS, className)}>
        <FiltersGroupProvider value="sidebar">{children}</FiltersGroupProvider>
      </aside>
  );
}