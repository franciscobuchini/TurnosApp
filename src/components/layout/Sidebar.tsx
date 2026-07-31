/* 
  src/components/layout/Sidebar.tsx
  Sidebar: barra de navegación con íconos (nav, fija) + panel de contenido (children libres).
*/

import { CalendarDays, Palette, Package, Store, Smile } from 'lucide-react';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

interface SidebarProps {
  children?: ReactNode;
  className?: string;
}

const navItems = [
  { to: '/admin/agenda', icon: CalendarDays },
  { to: '/admin/equipo', icon: Store },
  { to: '/admin/productos', icon: Package },
  { to: '/admin/clientes', icon: Smile },
  { to: '/admin/personalizacion', icon: Palette },
];

// ============================================================
// Sidebar: contenedor padre que envuelve nav y content
// ============================================================

/* SidebarClasses: envuelve SidebarNav y SidebarContent para que ambos
   se comporten como un solo item flex dentro de Layout. */
const SidebarClasses = {
  required: 'flex h-full gap-(--size-m) pr-(--size-m)',
  style: '',
};

// ============================================================
// Nav: barra angosta de navegación con íconos
// ============================================================

const SidebarNavClasses = {
  required: 'hidden h-full flex-col tablet:flex',
  style: '',
};

const SidebarNavListClasses = {
  required: 'flex flex-col gap-(--size-m) p-(--size-m) h-full',
  style: 'bg-stone-900 rounded-3xl',
};

function SidebarNav() {
  return (
    <aside className={twMerge(SidebarNavClasses.required, SidebarNavClasses.style)}>
      <nav className={twMerge(SidebarNavListClasses.required, SidebarNavListClasses.style)}>
        {navItems.map(({ to, icon: Icon }) => (
          <Button
            key={to}
            to={to}
            textAlign="center"
            icon={<Icon size={20} />}
            textClassName="tablet:hidden desktop:inline"
          />
        ))}
      </nav>
    </aside>
  );
}

// ============================================================
// Content: panel ancho con contenido libre (children)
// ============================================================

const SidebarContentClasses = {
  required: 'h-full flex flex-col w-(--size-8xl) gap-(--size-m) overflow-hidden',
  style: '',
};

// ============================================================
// Sidebar: componente principal exportado
// ============================================================

export default function Sidebar({ children, className }: SidebarProps) {
  return (
    <div className={twMerge(SidebarClasses.required, SidebarClasses.style)}>
      <SidebarNav />
      <aside className={twMerge(SidebarContentClasses.required, SidebarContentClasses.style, className)}>
        {children}
      </aside>
    </div>
  );
}