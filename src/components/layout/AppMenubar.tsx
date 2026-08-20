/*
  src/components/layout/AppMenubar.tsx
  Menubar vertical de accesos directos del admin, a la izquierda del
  sidebar: solo íconos. Autónomo (resuelve su propia ubicación con
  useLocation), así que cualquier página que lo monte vía
  <Layout menubar={<AppMenubar />}> lo obtiene funcionando sin pasarle props.

  Los accesos principales van de arriba hacia abajo — en pc: Inicio,
  Equipo, Servicios, Clientes, Estadísticas, Marketing, Editar web (ver
  PC_TAIL_ITEMS/SIDEBAR_PANEL_ITEMS); en mobile el orden es otro (ver el
  return de más abajo, que bifurca por tier). Estadísticas/Marketing
  todavía son entradas visuales de roadmap, por eso quedan deshabilitadas.
  Ajustes y Ver mi sitio web viven como accesos rápidos en el grupo
  inferior; Cerrar sesión se mueve a la vista de Ajustes.

  Notificaciones ya no vive acá (ni en pc ni en mobile): pasó a ser una
  sección siempre abierta debajo del Calendar — en pc, el de la sidebar por
  defecto (AdminSidebar.tsx); en mobile, el del overlay a pantalla completa
  de WeekSelector.tsx (mismo NotificationsList en los dos casos). Por eso
  ya no hay ningún estado de notificaciones acá.

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

import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  Calendar,
  ChartColumn,
  Globe,
  Megaphone,
  Moon,
  Palette,
  Scissors,
  Settings,
  Sun,
  UserCog,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import ContentHeader from '@/components/ui/content-header';
import Logo from '@/components/ui/logo';
import AddButton from '@/components/buttons/AddButton';
import MobileMenuButton from '@/components/buttons/MobileMenuButton';
import MobileOverlay from './MobileOverlay';
import { DetailsPanelOptionRow, type DetailsPanelOption } from '@/components/widgets/sidebarWidgets/DetailsPanel';
import { TeamFilterButton, ServiceFilterButton, ClientFilterButton } from '@/components/widgets/sidebarWidgets/DropdownRowActions';
import { getAppointments } from '@/database/data';
import type { FiltersOption } from '@/database/types';
import { useLayoutTier } from '@/hooks/useLayoutTier';
import { useTheme } from '@/hooks/useTheme';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

const MENUBAR_CLASS =
  'flex h-full w-16 shrink-0 flex-col items-center gap-3 rounded-4xl bg-card py-4 border border-border';

const GROUP_CLASS = 'flex flex-col items-center gap-2';

const ICON_CLASS = 'size-5';

/* Mobile (ver useLayoutTier): el menubar vertical desaparece y en su
   lugar queda sólo este botón flotante, arriba de todo lo demás (z-50),
   que abre el mismo menú a pantalla completa (MOBILE_OVERLAY_CLASS) —
   ver el return de más abajo, que bifurca por tier ANTES de llegar al
   <nav> de siempre (que sigue exactamente igual para "pc"). El botón en
   sí es el logo (MobileMenuButton ya lo dibuja con su propia sombra),
   así que acá sólo se pisa posición/tamaño. */
const MOBILE_TRIGGER_CLASS = 'fixed top-4 left-4 z-50 size-12';

/* min-h-dvh: la sidebar embebida "ocupa toda la pantalla" al abrir el
   menú (scrollear el overlay recién ahí muestra el menú de navegación
   de más abajo) — flex flex-col para que <Sidebar> (que en mobile pasa
   a ser flex-1, ver Sidebar.tsx) tenga de qué altura tomar ese 100%. */
const MOBILE_SIDEBAR_SECTION_CLASS = 'flex min-h-dvh flex-col';

const MOBILE_ITEM_CLASS =
  'h-14 w-full shrink-0 justify-start gap-4 rounded-3xl px-4 text-base text-muted-foreground hover:text-foreground';

const MOBILE_ITEM_ACTIVE_CLASS = 'bg-card text-foreground';

/* Lista de los overlays de Servicios/Clientes — mismas filas
   (DetailsPanelOptionRow) que usa EntitySidebarPanel.tsx (pc), sin el
   <details> colapsable (acá no hace falta: cada uno ya vive dentro de su
   propio MobileOverlay a pantalla completa). */
const MOBILE_LIST_CLASS = 'flex flex-col gap-1';

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

/* Sólo PC (ver el return de más abajo): mismos ítems que MAIN_ITEMS.slice(1)
   (mobile sigue con ese orden, sin tocar), pero reordenados — acá
   Estadísticas/Marketing van antes que Editar web. Se arma por `to` en vez
   de repetir los objetos (mismo ícono/disabled que MAIN_ITEMS, una sola
   fuente de verdad). */
const PC_TAIL_ORDER = ['/admin/metricas', '/admin/marketing', '/personalizacion'];
const PC_TAIL_ITEMS: MenubarItem[] = PC_TAIL_ORDER.map(
  (to) => MAIN_ITEMS.find((item) => item.to === to)!,
);

/* Sólo PC (ver el return de más abajo): Equipo/Servicios/Clientes ya no
   viven como acordeón en la sidebar (AdminSidebar.tsx, que ahora es sólo
   Calendar + Notificaciones) — pasan a ser accesos acá, que reemplazan TODA
   la sidebar por su panel (ver EntitySidebarPanel.tsx y sidebarPanel en
   Dashboard.tsx), igual que ya hacen "Agregar turno"/edición de turno. El
   maincontent no se entera: sigue mostrando ScheduleView siempre. Mismo
   orden e íconos que ya usa el menú mobile de acá abajo para estos tres. */
export type SidebarPanel = 'team' | 'services' | 'clients';

interface SidebarPanelItem {
  id: SidebarPanel;
  label: string;
  icon: ReactNode;
}

const SIDEBAR_PANEL_ITEMS: SidebarPanelItem[] = [
  { id: 'team', label: 'Equipo', icon: <UserCog className={ICON_CLASS} /> },
  { id: 'services', label: 'Servicios', icon: <Scissors className={ICON_CLASS} /> },
  { id: 'clients', label: 'Clientes', icon: <Users className={ICON_CLASS} /> },
];

interface AppMenubarProps {
  /* Sidebar de "agregar turno" abierto: "Inicio" deja de marcarse activo
     aunque la ruta sea /admin (el flujo tapa la agenda normal). */
  addShiftOpen?: boolean;
  /* Callback para cerrar el panel de agregar turno cuando se navega a otro menú */
  onCloseAddShift?: () => void;
  /* Sólo PC: panel de Equipo/Servicios/Clientes activo en la sidebar (ver
     SIDEBAR_PANEL_ITEMS más arriba) — mobile no las usa, sigue con sus
     propios teamOverlayOpen/servicesOverlayOpen/clientsOverlayOpen acá
     abajo, sin tocar. */
  sidebarPanel?: SidebarPanel | null;
  onCloseSidebarPanel?: () => void;
  /* La misma sidebar que la página le pasa a <Layout sidebar>  (ver
     Dashboard.tsx) — sólo se usa en mobile: Layout.tsx deja de
     renderizarla en su fila (no entra al lado de Schedule en una
     pantalla angosta) y en su lugar aparece acá arriba, dentro del menú
     a pantalla completa (ver MOBILE_OVERLAY_CLASS). En pc no se usa
     (Layout ya la muestra donde siempre). Quien no pase nada acá
     simplemente no suma esa sección al menú mobile. */
  sidebar?: ReactNode;
  /* Estado del menú mobile, controlado desde afuera — sólo Dashboard.tsx
     lo pasa (ver mobileMenuOpen ahí): en la página del Schedule, el botón
     que lo abre ya no vive acá, vive embebido en la fila de WeekSelector
     (ScheduleView), así que los dos necesitan estar de acuerdo en el
     mismo estado. Quien monta <AppMenubar /> sin pasar nada (ej.
     Personalizacion.tsx) sigue funcionando solo, con estado propio (ver
     el patrón controlado/no controlado más abajo). */
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: Dispatch<SetStateAction<boolean>>;
  /* "Equipo"/"Clientes"/"Servicios" del menú mobile (ver MOBILE_ITEM_CLASS
     más abajo) — a diferencia de sidebar (que sólo embebe lo que YA arma
     otra pantalla), estos tres arman su propia lista acá adentro,
     reusando TeamFilterButton/ServiceFilterButton/ClientFilterButton
     (mismo "Ocultar/Mostrar"+"Ver perfil"/"Ver detalles" que AdminSidebar)
     para no duplicar esa lógica. Sólo Dashboard.tsx las pasa; sin ellas,
     esos accesos simplemente no aparecen. */
  teamFilters?: FiltersOption[];
  toggleTeamFilter?: (id: string, checked: boolean) => void;
  serviceFilters?: DetailsPanelOption[];
  toggleServiceActive?: (id: string, active: boolean) => void;
  clientFilters?: FiltersOption[];
}

export default function AppMenubar({
  addShiftOpen = false,
  onCloseAddShift,
  sidebarPanel = null,
  onCloseSidebarPanel,
  sidebar,
  mobileMenuOpen: controlledMobileMenuOpen,
  setMobileMenuOpen: setControlledMobileMenuOpen,
  teamFilters,
  toggleTeamFilter,
  serviceFilters,
  toggleServiceActive,
  clientFilters,
}: AppMenubarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { confirmNavigation } = useUnsavedChanges();
  const tier = useLayoutTier();

  /* "Editar web" pide el PIN de administrador antes de entrar a
     Personalización (edita lo que ven los clientes en el sitio público) —
     mismo ConfirmDialog con requirePin que ya usa "Eliminar" en ViewLayout. */
  const [editWebConfirmOpen, setEditWebConfirmOpen] = useState(false);
  /* Sólo aplica en mobile (ver MOBILE_TRIGGER_CLASS/MOBILE_OVERLAY_CLASS
     más abajo) — en pc no se usa. Controlado/no controlado: si el padre
     pasa mobileMenuOpen/setMobileMenuOpen (Dashboard.tsx) se usa eso; si
     no (Personalizacion.tsx), este estado interno hace de respaldo para
     que el botón flotante siga funcionando solo. */
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const mobileMenuOpen = controlledMobileMenuOpen ?? internalMobileMenuOpen;
  const setMobileMenuOpen = setControlledMobileMenuOpen ?? setInternalMobileMenuOpen;

  /* "Equipo"/"Servicios"/"Clientes" del menú mobile: cada uno abre su
     propio MobileOverlay (no el mismo que el menú de navegación) con la
     lista completa — mismas filas/acciones que AdminSidebar.tsx. */
  const [teamOverlayOpen, setTeamOverlayOpen] = useState(false);
  const [servicesOverlayOpen, setServicesOverlayOpen] = useState(false);
  const [clientsOverlayOpen, setClientsOverlayOpen] = useState(false);

  /* Mismo criterio que handleToggleServiceActive en EntitySidebarPanel.tsx
     (pc): desactivar un servicio con turnos futuros pide confirmación
     (afecta lo que un cliente puede reservar); reactivar no pierde nada, se
     aplica directo. Duplicado a propósito (no extraído a un hook
     compartido): es la única lógica no puramente visual de estos overlays
     de mobile, y mantenerla acá evita tocar EntitySidebarPanel.tsx (pc)
     para esto. */
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null);
  const pendingService = serviceFilters?.find((f) => f.id === pendingDeactivateId);

  const handleToggleServiceActive = (id: string, active: boolean) => {
    if (!active) {
      const serviceLabel = serviceFilters?.find((f) => f.id === id)?.label;
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const hasAppointments = serviceLabel
        ? getAppointments().some((apt) => apt.service === serviceLabel && apt.date >= todayStr)
        : false;

      if (hasAppointments) {
        setPendingDeactivateId(id);
        return;
      }

      toggleServiceActive?.(id, false);
      return;
    }
    toggleServiceActive?.(id, true);
  };

  /* Cualquier navegación (un ítem de acá abajo, o "Ver detalles"/"Agregar
     un nuevo..." tocado DENTRO de la sidebar embebida) cierra el menú —
     si no, quedaría tapando la página nueva. Los controles que no
     navegan (tildar un filtro, abrir un acordeón) no disparan esto, así
     que se puede seguir interactuando con la sidebar sin que se cierre
     sola. En modo controlado (Dashboard.tsx) esto ya lo hace el mismo
     efecto de location.pathname que resetea el resto del estado — este
     de acá sólo hace falta para el modo no controlado. */
  useEffect(() => {
    if (setControlledMobileMenuOpen) return;
    setInternalMobileMenuOpen(false);
  }, [pathname, setControlledMobileMenuOpen]);

  const isActive = (to: string) => !addShiftOpen && !sidebarPanel && pathname === to;


  /* Con panel de "agregar turno" abierto, los botones de nav lo cierran Y
     navegan en el mismo click: un solo toque saca de cualquier vista. Pasa
     por confirmNavigation así igual avisa si la vista actual tiene cambios
     sin guardar. */
  const handleNavClick = (to: string) => {
    confirmNavigation(() => {
      if (addShiftOpen && onCloseAddShift) {
        onCloseAddShift();
      }
      /* Sin esto, tocar "Inicio" ya estando en /admin con un panel de
         sidebar abierto no lo cerraría: navigate('/admin') es un no-op de
         ruta (el pathname no cambia), así que el efecto de Dashboard.tsx
         que resetea todo por cambio de pathname no llega a dispararse. */
      if (sidebarPanel && onCloseSidebarPanel) {
        onCloseSidebarPanel();
      }
      navigate(to);
    });
  };

  /* Si ya está abierto ESTE panel, lo cierra (toggle-off); si no, navega a
     /admin con el panel pedido en location.state — funciona igual estando
     ya en /admin, en otra ruta de Dashboard (ej. /admin/miembro/Juan, hoy
     sin sidebar) o en Personalización (AppMenubar sin controlar).
     Dashboard.tsx lee ese state y abre el panel (ver el efecto de
     location.state ahí). */
  const handleSidebarPanelClick = (panel: SidebarPanel) => {
    confirmNavigation(() => {
      if (sidebarPanel === panel && onCloseSidebarPanel) {
        onCloseSidebarPanel();
      } else {
        navigate('/admin', { state: { openSidebarPanel: panel } });
      }
    });
  };

  if (tier === 'mobile') {
    const handleMobileNavClick = (to: string) => {
      setMobileMenuOpen(false);
      handleNavClick(to);
    };

    /* /admin (Schedule): el botón que abre esto ya no flota acá — vive
       embebido en la fila de WeekSelector (ScheduleView), compartiendo
       espacio con él y con el avatar del empleado que se está mostrando.
       En cualquier otra página (sin ese lugar donde "compartir espacio"),
       sigue flotando acá como siempre. */
    const isSchedulePage = pathname === '/admin';

    return (
      <>
        {!isSchedulePage && (
          <MobileMenuButton onClick={() => setMobileMenuOpen(true)} className={MOBILE_TRIGGER_CLASS} />
        )}

        {mobileMenuOpen && (
          <MobileOverlay onClose={() => setMobileMenuOpen(false)}>
            {sidebar && (
              <>
                <div className={MOBILE_SIDEBAR_SECTION_CLASS}>{sidebar}</div>
                <div className="my-2 border-t border-border" />
              </>
            )}

            <Button
              onClick={() => handleMobileNavClick('/admin')}
              variant="ghost"
              className={twMerge(MOBILE_ITEM_CLASS, isActive('/admin') && MOBILE_ITEM_ACTIVE_CLASS)}
            >
              <Calendar className={ICON_CLASS} />
              Inicio
            </Button>

            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                setTeamOverlayOpen(true);
              }}
              variant="ghost"
              className={MOBILE_ITEM_CLASS}
            >
              <UserCog className={ICON_CLASS} />
              Equipo
            </Button>

            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                setServicesOverlayOpen(true);
              }}
              variant="ghost"
              className={MOBILE_ITEM_CLASS}
            >
              <Scissors className={ICON_CLASS} />
              Servicios
            </Button>

            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                setClientsOverlayOpen(true);
              }}
              variant="ghost"
              className={MOBILE_ITEM_CLASS}
            >
              <Users className={ICON_CLASS} />
              Clientes
            </Button>

            {PC_TAIL_ITEMS.map(({ to, label, icon, disabled }) => (
              <Button
                key={to}
                onClick={() => {
                  if (disabled) return;
                  if (to === '/personalizacion') {
                    setMobileMenuOpen(false);
                    setEditWebConfirmOpen(true);
                    return;
                  }
                  handleMobileNavClick(to);
                }}
                variant="ghost"
                className={twMerge(MOBILE_ITEM_CLASS, isActive(to) && MOBILE_ITEM_ACTIVE_CLASS)}
                disabled={disabled}
              >
                {icon}
                {label}
              </Button>
            ))}

            <div className="my-2 border-t border-border" />

            <Button
              onClick={() => handleMobileNavClick('/admin/ajustes')}
              variant="ghost"
              className={twMerge(MOBILE_ITEM_CLASS, isActive('/admin/ajustes') && MOBILE_ITEM_ACTIVE_CLASS)}
            >
              <Settings className={ICON_CLASS} />
              Ajustes
            </Button>

            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                window.open('/site', '_blank', 'noopener,noreferrer');
              }}
              variant="ghost"
              className={MOBILE_ITEM_CLASS}
            >
              <Globe className={ICON_CLASS} />
              Ver mi sitio web
            </Button>

            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                toggleTheme();
              }}
              variant="ghost"
              className={MOBILE_ITEM_CLASS}
            >
              {theme === 'dark' ? <Moon className={ICON_CLASS} /> : <Sun className={ICON_CLASS} />}
              {theme === 'dark' ? 'Tema: oscuro' : 'Tema: claro'}
            </Button>
          </MobileOverlay>
        )}

        {teamOverlayOpen && (
          <MobileOverlay onClose={() => setTeamOverlayOpen(false)}>
            <ContentHeader title="Equipo" />
            <div className={MOBILE_LIST_CLASS}>
              {teamFilters?.map((option) => (
                <DetailsPanelOptionRow
                  key={option.id}
                  option={option}
                  renderDropdownItems={() => [
                    <TeamFilterButton
                      key="row"
                      option={option}
                      onToggle={toggleTeamFilter}
                      onOpenDetails={() =>
                        confirmNavigation(() => {
                          setTeamOverlayOpen(false);
                          navigate(`/admin/miembro/${encodeURIComponent(option.label)}`);
                        })
                      }
                    />,
                  ]}
                />
              ))}
            </div>
            <AddButton
              text="Agregar un nuevo miembro"
              onClick={() =>
                confirmNavigation(() => {
                  setTeamOverlayOpen(false);
                  navigate('/admin/miembro');
                })
              }
            />
          </MobileOverlay>
        )}

        {servicesOverlayOpen && (
          <MobileOverlay onClose={() => setServicesOverlayOpen(false)}>
            <ContentHeader title="Servicios" />
            <div className={MOBILE_LIST_CLASS}>
              {serviceFilters?.map((option) => (
                <DetailsPanelOptionRow
                  key={option.id}
                  option={option}
                  renderDropdownItems={() => [
                    <ServiceFilterButton
                      key="row"
                      option={option}
                      onToggleActive={handleToggleServiceActive}
                      onOpenDetails={() =>
                        confirmNavigation(() => {
                          setServicesOverlayOpen(false);
                          navigate(`/admin/servicio/${encodeURIComponent(option.label)}`);
                        })
                      }
                    />,
                  ]}
                />
              ))}
            </div>
            <AddButton
              text="Agregar un nuevo servicio"
              onClick={() =>
                confirmNavigation(() => {
                  setServicesOverlayOpen(false);
                  navigate('/admin/servicio');
                })
              }
            />
          </MobileOverlay>
        )}

        {clientsOverlayOpen && (
          <MobileOverlay onClose={() => setClientsOverlayOpen(false)}>
            <ContentHeader title="Clientes" />
            <div className={MOBILE_LIST_CLASS}>
              {clientFilters?.map((option) => (
                <DetailsPanelOptionRow
                  key={option.id}
                  option={option}
                  renderDropdownItems={() => [
                    <ClientFilterButton
                      key="row"
                      option={option}
                      onOpenDetails={() =>
                        confirmNavigation(() => {
                          setClientsOverlayOpen(false);
                          navigate(`/admin/cliente/${encodeURIComponent(option.label)}`);
                        })
                      }
                    />,
                  ]}
                />
              ))}
            </div>
            <AddButton
              text="Agregar un nuevo cliente"
              onClick={() =>
                confirmNavigation(() => {
                  setClientsOverlayOpen(false);
                  navigate('/admin/cliente');
                })
              }
            />
          </MobileOverlay>
        )}

        <ConfirmDialog
          open={editWebConfirmOpen}
          onOpenChange={setEditWebConfirmOpen}
          title="¿Editar web?"
          description="Vas a entrar a Personalización, donde se edita lo que ven tus clientes en el sitio público."
          confirmText="Continuar"
          onConfirm={() => handleNavClick('/personalizacion')}
          requirePin
        />

        {pendingService && (
          <ConfirmDialog
            open
            onOpenChange={(open) => !open && setPendingDeactivateId(null)}
            title={`¿Desactivar "${pendingService.label}"?`}
            description={`Este servicio se va a desactivar para tus clientes. Los turnos ya asignados de "${pendingService.label}" se van a mantener.`}
            confirmText="Desactivar"
            onConfirm={() => {
              toggleServiceActive?.(pendingService.id, false);
              setPendingDeactivateId(null);
            }}
            requirePin
          />
        )}
      </>
    );
  }

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
        {SIDEBAR_PANEL_ITEMS.map(({ id, label, icon }) => (
          <Button
            key={id}
            onClick={() => handleSidebarPanelClick(id)}
            variant={sidebarPanel === id ? 'default' : 'ghost'}
            size="icon-lg"
            icon={icon}
            aria-label={label}
            title={label}
          />
        ))}
        {PC_TAIL_ITEMS.map(({ to, label, icon, disabled }) => (
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
