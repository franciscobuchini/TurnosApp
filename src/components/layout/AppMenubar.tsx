/*
  src/components/layout/AppMenubar.tsx
  Menubar vertical de accesos directos del admin, a la izquierda del
  sidebar: solo íconos. Autónomo (resuelve su propia ubicación con
  useLocation), así que cualquier página que lo monte vía
  <Layout menubar={<AppMenubar />}> lo obtiene funcionando sin pasarle props.

  Arriba, la imagen del negocio: al clickearla abre un Dropdown con
  "Ajustes" (Ajustes > Negocio), "Ver sitio web" (el sitio público, en una
  pestaña nueva — no se pierde la sesión de admin) y "Cerrar sesión", que
  pide confirmación antes de salir (ConfirmDialog). Esa confirmación no
  puede vivir dentro del item del Dropdown: el Popover se cierra (y
  desmonta su contenido) ante cualquier click adentro, así que el estado
  pendingLogout y el ConfirmDialog viven acá, en AppMenubar, que no está
  dentro de ningún Popover (mismo patrón que la confirmación de desactivar
  un servicio en AdminSidebar). La app todavía no tiene login real (sin
  backend de auth), así que "Cerrar sesión" por ahora sólo saca del admin a
  la landing — el día que haya sesión de verdad, es el único lugar que hay
  que tocar. Los accesos del medio quedan centrados verticalmente entre ese
  grupo y el de ajustes. El de tema no navega: alterna claro/oscuro directo
  (useTheme). El logo de la app es decorativo (no navega) y va abajo de
  todo.

  Las filas del dropdown del negocio parten de DROPDOWN_ITEM_CLASS, la
  misma base que usan las de DropdownRowActions (Equipo/Servicios/Clientes
  en la sidebar) — antes cada una tenía su propia clase declarada aparte y
  no quedaban iguales. Acá se pisa el justify-between de la base a
  justify-start: DropdownRowActions separa "label ... ícono indicador" a los
  extremos, mientras que acá el contenido es ícono+label agrupados, como
  cualquier ítem de menú.

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
import { twMerge } from 'tailwind-merge';
import {
  Bell,
  Calendar,
  ChartColumn,
  ExternalLink,
  Globe,
  LogOut,
  Megaphone,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dropdown, DROPDOWN_ITEM_CLASS } from '@/components/ui/dropdown';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Logo from '@/components/ui/logo';
import Image from '@/components/ui/image';
import { getBookingRequests, getBusiness, DATA_CHANGE_EVENT } from '@/database/data';
import type { BookingRequest } from '@/database/types';
import { useTheme } from '@/hooks/useTheme';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

/* DROPDOWN_ITEM_CLASS trae justify-between (pensado para "label ... ícono
   indicador" como en DropdownRowActions) — acá el contenido es ícono+label
   agrupados, como cualquier ítem de menú, así que se pisa a justify-start. */
const BUSINESS_MENU_ITEM_CLASS = twMerge(DROPDOWN_ITEM_CLASS, 'justify-start gap-3');

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
  const business = getBusiness();
  const { theme, toggleTheme } = useTheme();
  const { confirmNavigation } = useUnsavedChanges();

  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(() => getBookingRequests());
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

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

  return (
    <nav className={MENUBAR_CLASS} aria-label="Accesos directos">
      <Dropdown
        content={<Image src={business.image} name={business.name} className="size-10 shrink-0" />}
        className="h-auto w-auto rounded-full p-0 hover:bg-transparent"
        items={[
          <Button
            key="ajustes"
            variant="ghost"
            text="Ajustes"
            icon={<Settings size={16} />}
            onClick={() => handleNavClick('/admin/ajustes')}
            className={BUSINESS_MENU_ITEM_CLASS}
          />,
          <Button
            key="ver-sitio"
            variant="ghost"
            text="Ver sitio web"
            icon={<ExternalLink size={16} />}
            onClick={() => window.open('/site', '_blank', 'noopener,noreferrer')}
            className={BUSINESS_MENU_ITEM_CLASS}
          />,
          <Button
            key="cerrar-sesion"
            variant="ghost"
            text="Cerrar sesión"
            icon={<LogOut size={16} />}
            onClick={() => setLogoutConfirmOpen(true)}
            className={BUSINESS_MENU_ITEM_CLASS}
          />,
        ]}
      />

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="¿Cerrar sesión?"
        description="Vas a salir del panel de administración."
        confirmText="Cerrar sesión"
        onConfirm={() => handleNavClick('/')}
      />

      <div className="flex-1" />

      <div className={GROUP_CLASS}>
        <div className="relative">
          <Button
            onClick={() => {
              if (onToggleNotifications) {
                onToggleNotifications();
              } else {
                /* Desde páginas que no controlan notificationsOpen
                   (ej. Personalización), navegar a /admin con state
                   para que Dashboard abra las notificaciones. */
                navigate('/admin', { state: { openNotifications: true } });
              }
            }}
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
        {MAIN_ITEMS.map(({ to, label, icon }) => (
          <Button
            key={to}
            onClick={() => handleNavClick(to)}
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
