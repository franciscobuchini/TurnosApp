/*
  src/components/layout/AppMenubar.tsx
  Menubar vertical de accesos directos del admin, a la izquierda del
  sidebar: solo íconos. Autónomo (resuelve su propia ubicación con
  useLocation), así que cualquier página que lo monte vía
  <Layout menubar={<AppMenubar />}> lo obtiene funcionando sin pasarle props.

  Arriba, la imagen del negocio (Ajustes > Negocio). Los accesos del medio
  quedan centrados verticalmente entre ese grupo y el de ajustes. El de tema
  no navega: alterna claro/oscuro directo (useTheme). El logo de la app es
  decorativo (no navega) y va abajo de todo.

  El botón de "Crear turno" que vivía acá se movió a ScheduleControls
  (esquina inferior izquierda del Schedule) — addShiftOpen/onCloseAddShift
  siguen acá porque los ítems de navegación de abajo igual necesitan cerrar
  el flujo antes de navegar a otra página.
*/

import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChartColumn,
  Globe,
  Megaphone,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import Image from '@/components/ui/image';
import { getBusiness } from '@/database/data';
import { useTheme } from '@/hooks/useTheme';

const MENUBAR_CLASS =
  'flex h-full w-16 shrink-0 flex-col items-center gap-3 rounded-4xl bg-card py-4 border border-border';

const GROUP_CLASS = 'flex flex-col items-center gap-2';

const ICON_CLASS = 'size-5';

interface MenubarItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const MAIN_ITEMS: MenubarItem[] = [
  { to: '/admin', label: 'Inicio', icon: <Calendar className={ICON_CLASS} /> },
  { to: '/personalizacion', label: 'Editar web', icon: <Globe className={ICON_CLASS} /> },
  { to: '/admin/metricas', label: 'Métricas', icon: <ChartColumn className={ICON_CLASS} /> },
  { to: '/admin/marketing', label: 'Marketing', icon: <Megaphone className={ICON_CLASS} /> },
];


interface AppMenubarProps {
  /* Sidebar de "agregar turno" abierto: "Inicio" deja de marcarse activo
     aunque la ruta sea /admin (el flujo tapa la agenda normal). */
  addShiftOpen?: boolean;
  /* Callback para cerrar el panel de agregar turno cuando se navega a otro menú */
  onCloseAddShift?: () => void;
}

export default function AppMenubar({ addShiftOpen = false, onCloseAddShift }: AppMenubarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const business = getBusiness();
  const { theme, toggleTheme } = useTheme();

  const isActive = (to: string) => !addShiftOpen && pathname === to;

  /* Con panel de "agregar turno" abierto, los botones de nav lo cierran Y
     navegan en el mismo click: un solo toque saca de cualquier vista. */
  const handleNavClick = (to: string) => {
    if (addShiftOpen && onCloseAddShift) {
      onCloseAddShift();
    }
    navigate(to);
  };

  return (
    <nav className={MENUBAR_CLASS} aria-label="Accesos directos">
      <button
        type="button"
        onClick={() => navigate('/admin/ajustes')}
        className="cursor-pointer"
        aria-label="Tu negocio"
        title="Tu negocio"
      >
        <Image src={business.image} name={business.name} className="size-10 shrink-0" />
      </button>

      <div className="flex-1" />

      <div className={GROUP_CLASS}>
        {MAIN_ITEMS.map(({ to, label, icon }) => (
          <Button
            key={to}
            to={addShiftOpen ? undefined : to}
            onClick={addShiftOpen ? () => handleNavClick(to) : undefined}
            variant={isActive(to) ? 'default' : 'ghost'}
            size="icon-lg"
            icon={icon}
            aria-label={label}
            title={label}
          />
        ))}
      </div>

      <div className="flex-1" />

      <div className={GROUP_CLASS}>
        <Button
          variant="ghost"
          size="icon-lg"
          icon={theme === 'dark' ? <Moon className={ICON_CLASS} /> : <Sun className={ICON_CLASS} />}
          aria-label={theme === 'dark' ? 'Tema: oscuro' : 'Tema: claro'}
          title={theme === 'dark' ? 'Tema: oscuro' : 'Tema: claro'}
          onClick={toggleTheme}
        />
      </div>

      <Logo className="h-11 w-auto shrink-0" />
    </nav>
  );
}
