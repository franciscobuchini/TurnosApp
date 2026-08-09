/* 
  src/components/layout/Sidebar.tsx
  Sidebar: barra de navegación con íconos (nav, fija) + panel de contenido (children libres).
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '../../functions/detailPanelColapseFunction';
import SidebarHeader from '../widgets/sidebarWidgets/SidebarHeader';

interface SidebarProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  hideHeader?: boolean;
  headerAction?: ReactNode;
}

const SIDEBAR_CLASS = 'flex flex-col h-full min-w-0 shrink-0 gap-(--size-l) w-md overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

const SIDEBAR_INNER_CLASS = 'flex min-h-0 flex-1 flex-col gap-(--size-m)';

export default function Sidebar({ children, className, title = 'minube.site', hideHeader = false, headerAction }: SidebarProps) {
  return (
    <aside className={twMerge(SIDEBAR_CLASS, className)}>
      {hideHeader ? null : <SidebarHeader title={title} action={headerAction} />}
      <div className={SIDEBAR_INNER_CLASS}>
        <FiltersGroupProvider value="sidebar">{children}</FiltersGroupProvider>
      </div>
    </aside>
  );
}