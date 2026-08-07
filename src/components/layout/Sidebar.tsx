/* 
  src/components/layout/Sidebar.tsx
  Sidebar: barra de navegación con íconos (nav, fija) + panel de contenido (children libres).
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '../../functions/filtersGroupContext';
import MainHeader from '../interface/MainHeader';
import Logo from '../interface/Logo';

interface SidebarProps {
  children?: ReactNode;
  className?: string;
  title?: string;
}

const SIDEBAR_CLASS = 'flex flex-col h-full min-w-0 shrink-0 gap-(--size-m) p-(--size-m) w-md overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

const SIDEBAR_TITLE_CLASS = 'flex w-full shrink-0 bg-transparent';

const SIDEBAR_INNER_CLASS = 'flex min-h-0 flex-1 flex-col gap-(--size-m)';

export default function Sidebar({ children, className, title = 'minube.site' }: SidebarProps) {
  return (
    <aside className={twMerge(SIDEBAR_CLASS, className)}>
      <MainHeader title={title} leading={<Logo className="h-(--size-5xl) w-auto" />} className={SIDEBAR_TITLE_CLASS} titleClassName="text-neutral-50" />
      <div className={SIDEBAR_INNER_CLASS}>
        <FiltersGroupProvider value="sidebar">{children}</FiltersGroupProvider>
      </div>
    </aside>
  );
}