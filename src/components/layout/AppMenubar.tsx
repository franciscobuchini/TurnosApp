/*
  src/components/layout/AppMenubar.tsx
  Menubar vertical de accesos directos del admin, a la izquierda del
  sidebar: solo íconos. Autónomo (resuelve su propia ubicación con
  useLocation), así que cualquier página que lo monte vía
  <Layout menubar={<AppMenubar />}> lo obtiene funcionando sin pasarle props.

  Los accesos principales van de arriba hacia abajo: Inicio, notificaciones,
  editar web, métricas y marketing. Métricas/Marketing todavía son entradas
  visuales de roadmap, por eso quedan deshabilitadas. Ajustes y Ver mi sitio
  web viven como accesos rápidos en el grupo inferior; Cerrar sesión se mueve
  a la vista de Ajustes.

  El botón de "Crear turno" que vivía acá se movió a ScheduleControls
  (esquina inferior izquierda del Schedule) — addShiftOpen/onCloseAddShift
  siguen acá porque los ítems de navegación de abajo igual necesitan cerrar
  el flujo antes de navegar a otra página.

  Ningún ítem navega directo (nada de <Link to>, todo es onClick +
  navigate): todos pasan por confirmNavigation (useUnsavedChanges) primero,
  para que salir de una vista con cambios sin guardar (Ajustes, un
  Miembro/Servicio/Cliente en edición) avise antes de perderlos, sea cual
  sea el acceso que se use para salir.
*/

import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  ChartColumn,
  Globe,
  Megaphone,
  Moon,
  Palette,
  Settings,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Logo from '@/components/ui/logo';
import { getBookingRequests, DATA_CHANGE_EVENT } from '@/database/data';
import type { BookingRequest } from '@/database/types';
import { useTheme } from '@/hooks/useTheme';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

const MENUBAR_CLASS =
  'flex h-full w-16 shrink-0 flex-col items-center gap-3 rounded-4xl bg-card py-4 border border-border';

const GROUP_CLASS = 'flex flex-col items-center gap-2';

const ICON_CLASS = 'size-5';

interface MenubarItem {
  to: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}

const MAIN_ITEMS: MenubarItem[] = [
  { to: '/admin', label: 'Inicio', icon: <Calendar className={ICON_CLASS} /> },
  { to: '/personalizacion', label: 'Editar web', icon: <Palette className={ICON_CLASS} /> },
  { to: '/admin/metricas', label: 'Métricas', icon: <ChartColumn className={ICON_CLASS} />, disabled: true },
  { to: '/admin/marketing', label: 'Marketing', icon: <Megaphone className={ICON_CLASS} />, disabled: true },
];

interface AppMenubarProps {
  /* Sidebar de "agregar turno" abierto: "Inicio" deja de marcarse activo
     aunque la ruta sea /admin (el flujo tapa la agenda normal). */
  addShiftOpen?: boolean;
  /* Callback para cerrar el panel de agregar turno cuando se navega a otro menú */
  onCloseAddShift?: () => void;
  /* Estado del sidebar de notificaciones */
  notificationsOpen?: boolean;
  onToggleNotifications?: () => void;
}

export default function AppMenubar({
  addShiftOpen = false,
  onCloseAddShift,
  notificationsOpen = false,
  onToggleNotifications,
}: AppMenubarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { confirmNavigation } = useUnsavedChanges();

  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(() => getBookingRequests());
  /* "Editar web" pide el PIN de administrador antes de entrar a
     Personalización (edita lo que ven los clientes en el sitio público) —
     mismo ConfirmDialog con requirePin que ya usa "Eliminar" en ViewLayout. */
  const [editWebConfirmOpen, setEditWebConfirmOpen] = useState(false);

  useEffect(() => {
    const handleDataChange = () => {
      setBookingRequests(getBookingRequests());
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, []);

  const pendingCount = bookingRequests.filter((r) => r.status === 'pending').length;

  const isActive = (to: string) => !addShiftOpen && !notificationsOpen && pathname === to;


  /* Con panel de "agregar turno" abierto, los botones de nav lo cierran Y
     navegan en el mismo click: un solo toque saca de cualquier vista. Pasa
     por confirmNavigation así igual avisa si la vista actual tiene cambios
     sin guardar. */
  const handleNavClick = (to: string) => {
    confirmNavigation(() => {
      if (addShiftOpen && onCloseAddShift) {
        onCloseAddShift();
      }
      if (notificationsOpen && onToggleNotifications) {
        onToggleNotifications();
      }
      navigate(to);
    });
  };

  /* El botón de notificaciones no navega a otra ruta (abre un panel dentro
     de la misma /admin), pero igual puede tapar una vista con cambios sin
     guardar (ej. modo Bloqueos/Desbloqueos) — pasa por confirmNavigation
     por la misma razón que handleNavClick. */
  const handleNotificationsClick = () => {
    confirmNavigation(() => {
      if (onToggleNotifications) {
        onToggleNotifications();
      } else {
        /* Desde páginas que no controlan notificationsOpen
           (ej. Personalización), navegar a /admin con state
           para que Dashboard abra las notificaciones. */
        navigate('/admin', { state: { openNotifications: true } });
      }
    });
  };

  return (
    <nav className={MENUBAR_CLASS} aria-label="Accesos directos">
      <div className={GROUP_CLASS}>
        <Button
          onClick={() => handleNavClick('/admin')}
          variant={isActive('/admin') ? 'default' : 'ghost'}
          size="icon-lg"
          icon={<Calendar className={ICON_CLASS} />}
          aria-label="Inicio"
          title="Inicio"
        />
        <div className="relative">
          <Button
            onClick={handleNotificationsClick}
            variant={notificationsOpen ? 'default' : 'ghost'}
            size="icon-lg"
            icon={<Bell className={ICON_CLASS} />}
            aria-label={pendingCount > 0 ? `Notificaciones (${pendingCount} pendientes)` : 'Notificaciones'}
            title={pendingCount > 0 ? `Notificaciones (${pendingCount} pendientes)` : 'Notificaciones'}
          />
          {pendingCount > 0 && (
            <span className="pointer-events-none absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground shadow-md animate-in zoom-in-50">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </div>
        {MAIN_ITEMS.slice(1).map(({ to, label, icon, disabled }) => (
          <Button
            key={to}
            onClick={() => {
              if (disabled) return;
              if (to === '/personalizacion') {
                setEditWebConfirmOpen(true);
                return;
              }
              handleNavClick(to);
            }}
            variant={isActive(to) ? 'default' : 'ghost'}
            size="icon-lg"
            icon={icon}
            aria-label={label}
            title={label}
            disabled={disabled}
          />
        ))}
      </div>

      <ConfirmDialog
        open={editWebConfirmOpen}
        onOpenChange={setEditWebConfirmOpen}
        title="¿Editar web?"
        description="Vas a entrar a Personalización, donde se edita lo que ven tus clientes en el sitio público."
        confirmText="Continuar"
        onConfirm={() => handleNavClick('/personalizacion')}
        requirePin
      />

      <div className="flex-1" />

      <div className={GROUP_CLASS}>
        <Button
          onClick={() => handleNavClick('/admin/ajustes')}
          variant={isActive('/admin/ajustes') ? 'default' : 'ghost'}
          size="icon-lg"
          icon={<Settings className={ICON_CLASS} />}
          aria-label="Ajustes"
          title="Ajustes"
        />
        <Button
          onClick={() => window.open('/site', '_blank', 'noopener,noreferrer')}
          variant="ghost"
          size="icon-lg"
          icon={<Globe className={ICON_CLASS} />}
          aria-label="Ver mi sitio web"
          title="Ver mi sitio web"
        />
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
