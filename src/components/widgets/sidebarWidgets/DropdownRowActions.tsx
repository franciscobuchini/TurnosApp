import { useState, type ReactNode } from 'react';
import { ChevronRight, Eye, EyeOff, Power, PowerOff } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';
import { DROPDOWN_ITEM_CLASS } from '@/components/ui/dropdown';
import AddEntityView from '@/components/views/EntityView';
import AddClientView from '@/components/views/ClientView';
import ServiceView from '@/components/views/ServiceView';

/*
  src/components/widgets/sidebarWidgets/DropdownRowActions.tsx
  Todo lo que puede aparecer dentro de una fila del Dropdown de DetailsPanel
  (los paneles de Equipo/Servicios/Clientes de la sidebar), en un solo lugar:
  el toggle de ocultar/desactivar, el botón de ver detalles, y las 3 filas
  por entidad que arma EntitySidebarPanel/AddShiftSidebar (pc) y AppMenubar
  (overlays de mobile). Antes eran 6 archivos
  separados (DetailsButton, HideButton, ViewEntityDetailsButton,
  TeamFilterButton, ServiceFilterButton, ClientFilterButton) sin relación
  visible entre sí — DetailsButton no lo usaba nada más que esto, y
  "Desactivar" no tenía su propio componente porque ES este mismo toggle,
  solo que con otro texto (ver ServiceFilterButton más abajo).
*/

// ── Ver detalles ────────────────────────────────────────────────────────
// Abre la View de la entidad en modo lectura. Si se pasa onOpen (caso real
// de uso: navegar a la ruta de esa entidad), se delega ahí; si no, abre la
// View como overlay con estado propio.

interface ViewDetailsButtonProps {
  className?: string;
  onOpen?: () => void;
  triggerText?: string;
  renderView: (props: { open: boolean; onClose: () => void }) => ReactNode;
}

function ViewDetailsButton({ className, onOpen, triggerText = 'Detalles', renderView }: ViewDetailsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        text={triggerText}
        icon={<ChevronRight size={16} />}
        onClick={handleOpen}
        className={twMerge(DROPDOWN_ITEM_CLASS, className)}
      />
      {!onOpen && renderView({ open: isOpen, onClose: () => setIsOpen(false) })}
    </>
  );
}

// ── Ocultar/Mostrar o Activar/Desactivar ──────────────────────────────────
// Un solo botón para los dos casos: activeText/inactiveText/icon cambian el
// copy y el ícono según la entidad (comparar TeamFilterButton, que dice
// "Ocultar/Mostrar", con ServiceFilterButton, que dice "Desactivar/Activar").

interface ToggleVisibilityButtonProps {
  visible: boolean;
  onToggle?: (visible: boolean) => void;
  activeText?: ReactNode;
  inactiveText?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

function ToggleVisibilityButton({
  visible,
  onToggle,
  activeText,
  inactiveText,
  icon,
  className,
}: ToggleVisibilityButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={() => onToggle?.(!visible)}
      text={visible ? (activeText ?? 'Ocultar') : (inactiveText ?? 'Mostrar')}
      icon={icon ?? (visible ? <EyeOff size={16} /> : <Eye size={16} />)}
      className={twMerge(DROPDOWN_ITEM_CLASS, className)}
    />
  );
}

// ── Filas por entidad ──────────────────────────────────────────────────
// Lo que arma cada <DetailsPanel renderDropdownItems> en AdminSidebar y
// AddShiftSidebar: el toggle (si aplica) + el botón de ver detalles.

export interface DropdownRowOption {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  /** Sólo Servicios (ver ServiceFilterButton): independiente de `checked`
      (filtro de calendario) — si el servicio se puede reservar en el sitio. */
  active?: boolean;
}

interface TeamFilterButtonProps {
  option: DropdownRowOption;
  onToggle?: (id: string, checked: boolean) => void;
  onOpenDetails?: () => void;
  className?: string;
}

export function TeamFilterButton({ option, onToggle, onOpenDetails, className }: TeamFilterButtonProps) {
  return (
    <>
      <ToggleVisibilityButton
        visible={option.checked ?? true}
        onToggle={(visible) => onToggle?.(option.id, visible)}
        className={className}
      />
      <ViewDetailsButton
        triggerText="Ver perfil"
        onOpen={onOpenDetails}
        renderView={({ open, onClose }) => (
          <AddEntityView
            open={open}
            onClose={onClose}
            title={`Perfil de ${option.label}`}
            mode="view"
            memberName={option.label}
          />
        )}
      />
    </>
  );
}

interface ServiceFilterButtonProps {
  option: DropdownRowOption;
  /** A diferencia de onToggle (Equipo/Clientes, que sólo cambia un filtro
      local), esto persiste: desactivar saca el servicio del turnero público
      (ver getSiteServices en siteData.ts). Pide confirmación antes de
      desactivar (no de reactivar) — pero esa confirmación NO puede vivir acá
      adentro: este componente se renderiza como ítem de un Dropdown (ver
      ui/dropdown.tsx), que cierra su Popover ante cualquier click adentro,
      lo que desmontaría un ConfirmDialog declarado en este mismo árbol antes
      de llegar a mostrarse. Por eso sólo pide el toggle acá; quien pase
      onToggleActive (AdminSidebar) es responsable de confirmar antes de
      llamar de verdad a la función que persiste. */
  onToggleActive?: (id: string, active: boolean) => void;
  onOpenDetails?: () => void;
  className?: string;
}

export function ServiceFilterButton({ option, onToggleActive, onOpenDetails, className }: ServiceFilterButtonProps) {
  const isActive = option.active ?? true;

  return (
    <>
      <ToggleVisibilityButton
        visible={isActive}
        onToggle={(nextActive) => onToggleActive?.(option.id, nextActive)}
        activeText="Desactivar"
        inactiveText="Activar"
        icon={isActive ? <PowerOff size={16} /> : <Power size={16} />}
        className={className}
      />
      <ViewDetailsButton
        onOpen={onOpenDetails}
        renderView={({ open, onClose }) => (
          <ServiceView
            open={open}
            onClose={onClose}
            title={`Detalles de ${option.label}`}
            mode="view"
            serviceName={option.label}
          />
        )}
      />
    </>
  );
}

interface ClientFilterButtonProps {
  option: DropdownRowOption;
  onOpenDetails?: () => void;
  className?: string;
}

export function ClientFilterButton({ option, onOpenDetails, className }: ClientFilterButtonProps) {
  return (
    <ViewDetailsButton
      className={className}
      onOpen={onOpenDetails}
      renderView={({ open, onClose }) => (
        <AddClientView
          open={open}
          onClose={onClose}
          title={`Detalles de ${option.label}`}
          mode="view"
          clientName={option.label}
        />
      )}
    />
  );
}
