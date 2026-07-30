/* 
  src/components/interface/Sidebar.tsx
  Sidebar de la aplicación: barra de navegación con íconos + panel de acciones con header y contenido.
*/

import { CalendarDays, Palette, Package, Store, Smile } from 'lucide-react';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';
import Box from '../interface/Box';
import SidebarHeader from '../widgets/SidebarHeader';

interface SidebarProps {
  withNav?: boolean;
  withActions?: boolean;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  styleClassName?: string;
}

const navItems = [
  { to: '/admin/agenda', icon: CalendarDays },
  { to: '/admin/equipo', icon: Store },
  { to: '/admin/productos', icon: Package },
  { to: '/admin/clientes', icon: Smile },
  { to: '/admin/personalizacion', icon: Palette },
];

// ============================================================
// Sidebar: contenedor padre que envuelve nav y actions
// ============================================================

/* SidebarClasses: envuelve SidebarNav y SidebarActions para que ambos
   se comporten como un solo item flex dentro de Layout. */
const SidebarClasses = {
  required: 'flex h-full p-(--size-m) gap-(--size-xs)',
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
// Actions: panel ancho con header (título/subtítulo/acción) y contenido
// ============================================================

const SidebarActionsClasses = {
  required: 'hidden h-full flex flex-col w-(--size-7xl) gap-(--size-m) overflow-hidden',
  style: 'bg-stone-950',
};

const SidebarActionsContentClasses = {
  required: 'flex-1',
  style: '',
};

interface SidebarActionsProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
}

function SidebarActions({ title, subtitle, action, children }: SidebarActionsProps) {
  return (
    <aside className={twMerge(SidebarActionsClasses.required, SidebarActionsClasses.style)}>
      <SidebarHeader title={title} subtitle={subtitle} action={action} />
      <Box className={twMerge(SidebarActionsContentClasses.required, SidebarActionsContentClasses.style)}>
        {children}
      </Box>
    </aside>
  );
}

// ============================================================
// Sidebar: componente principal exportado
// ============================================================

export default function Sidebar({
  withNav = false,
  withActions = false,
  title,
  subtitle,
  action,
  children,
  className,
  styleClassName,
}: SidebarProps) {
  return (
    <div className={twMerge(SidebarClasses.required, styleClassName || SidebarClasses.style, className)}>
      {withNav && <SidebarNav />}
      {withActions && (
        <SidebarActions title={title || ''} subtitle={subtitle} action={action}>
          {children}
        </SidebarActions>
      )}
    </div>
  );
}