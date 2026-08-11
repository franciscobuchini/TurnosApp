/*
  src/components/layout/Sidebar.tsx
  Sidebar: panel de contenido (children libres), con scroll propio.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '@/hooks/useFiltersGroup';

interface SidebarProps {
  children?: ReactNode;
  className?: string;
  footer?: ReactNode;
}

const SIDEBAR_CLASS = 'flex flex-col h-full min-w-0 shrink-0 w-90';

const SIDEBAR_INNER_CLASS = 'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

export default function Sidebar({ children, className, footer }: SidebarProps) {
  return (
    <aside className={twMerge(SIDEBAR_CLASS, className)}>
      <div className={SIDEBAR_INNER_CLASS}>
        <FiltersGroupProvider value="sidebar">{children}</FiltersGroupProvider>
      </div>
      {footer && <div className="shrink-0">{footer}</div>}
    </aside>
  );
}