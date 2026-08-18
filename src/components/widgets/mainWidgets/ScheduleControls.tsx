/*
  src/components/widgets/mainWidgets/ScheduleControls.tsx
  Cluster de acciones flotante del Schedule (esquina inferior izquierda):
  "Crear turno" (antes vivía en AppMenubar, se movió acá) + zoom in/out de
  las filas. Los tres botones son circulares (el contenedor ya lo era, los
  botones ahora también) y un poco más grandes que el icon-lg de base.
*/

import type { Dispatch, SetStateAction } from 'react';
import { Ban, Plus, X, ZoomIn, ZoomOut } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';
import { canZoomIn, canZoomOut, zoomIn, zoomOut } from '@/functions/scheduleZoom';

interface ScheduleControlsProps {
  rowHeightPx: number;
  onRowHeightChange: Dispatch<SetStateAction<number>>;
  onAddShift: () => void;
  /** Flujo "Agregar turno" abierto: el botón de crear pasa a ser una "X"
      (bg-destructive) que cierra el flujo. */
  addShiftOpen?: boolean;
  onCloseAddShift?: () => void;
  /** Modo "Bloqueos / Desbloqueos" activo en el Schedule. */
  blockModeOpen?: boolean;
  onToggleBlockMode?: () => void;
  className?: string;
}

/* bg-(--color-surface-solid), no bg-card: es "parte" del Schedule (mismo
   motivo — sin efecto glass, ver Schedule.tsx). */
const SCHEDULE_CONTROLS_CLASS =
  'absolute bottom-2 left-2 z-40 flex items-center gap-1.5 rounded-full border border-border bg-(--color-surface-solid) p-1.5';

const CONTROL_BUTTON_CLASS = 'size-12 rounded-full';

const ICON_CLASS = 'size-6';

export default function ScheduleControls({
  rowHeightPx,
  onRowHeightChange,
  onAddShift,
  addShiftOpen = false,
  onCloseAddShift,
  blockModeOpen = false,
  onToggleBlockMode,
  className,
}: ScheduleControlsProps) {
  return (
    <div className={twMerge(SCHEDULE_CONTROLS_CLASS, className)}>
      <Button
        type="button"
        variant={addShiftOpen ? 'destructive' : 'default'}
        size="icon-lg"
        className={twMerge(CONTROL_BUTTON_CLASS, addShiftOpen && 'text-white')}
        icon={addShiftOpen ? <X className={ICON_CLASS} /> : <Plus className={ICON_CLASS} />}
        aria-label={addShiftOpen ? 'Cancelar turno' : 'Crear turno'}
        title={addShiftOpen ? 'Cancelar turno' : 'Crear turno'}
        onClick={addShiftOpen ? onCloseAddShift : onAddShift}
      />
      <Button
        type="button"
        variant={blockModeOpen ? 'destructive' : 'ghost'}
        size="icon-lg"
        className={twMerge(
          CONTROL_BUTTON_CLASS,
          blockModeOpen ? 'text-white' : 'hover:bg-destructive/15 text-muted-foreground hover:text-destructive',
        )}
        icon={blockModeOpen ? <X className={ICON_CLASS} /> : <Ban className={ICON_CLASS} />}
        aria-label={blockModeOpen ? 'Cerrar modo bloqueos' : 'Bloquear o desbloquear horarios'}
        title={blockModeOpen ? 'Cerrar modo bloqueos' : 'Bloquear / Desbloquear'}
        onClick={onToggleBlockMode}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className={CONTROL_BUTTON_CLASS}
        icon={<ZoomOut className={ICON_CLASS} />}
        aria-label="Alejar (filas más chicas)"
        title="Alejar"
        disabled={!canZoomOut(rowHeightPx)}
        onClick={() => onRowHeightChange(zoomOut)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className={CONTROL_BUTTON_CLASS}
        icon={<ZoomIn className={ICON_CLASS} />}
        aria-label="Acercar (filas más grandes)"
        title="Acercar"
        disabled={!canZoomIn(rowHeightPx)}
        onClick={() => onRowHeightChange(zoomIn)}
      />
    </div>
  );
}
