/*
  src/components/widgets/mainWidgets/ScheduleControls.tsx
  Cluster de acciones flotante del Schedule (esquina inferior izquierda):
  "Crear turno" (antes vivía en AppMenubar, se movió acá) + zoom in/out de
  las filas. Los tres botones son circulares (el contenedor ya lo era, los
  botones ahora también) y un poco más grandes que el icon-lg de base.
*/

import type { Dispatch, SetStateAction } from 'react';
import { Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';
import { canZoomIn, canZoomOut, zoomIn, zoomOut } from '@/functions/scheduleZoom';

interface ScheduleControlsProps {
  rowHeightPx: number;
  onRowHeightChange: Dispatch<SetStateAction<number>>;
  onAddShift: () => void;
  className?: string;
}

const SCHEDULE_CONTROLS_CLASS =
  'absolute bottom-2 left-2 z-40 flex items-center gap-1.5 rounded-full border border-border bg-card p-1.5';

const CONTROL_BUTTON_CLASS = 'size-12 rounded-full';

const ICON_CLASS = 'size-6';

export default function ScheduleControls({
  rowHeightPx,
  onRowHeightChange,
  onAddShift,
  className,
}: ScheduleControlsProps) {
  return (
    <div className={twMerge(SCHEDULE_CONTROLS_CLASS, className)}>
      <Button
        type="button"
        variant="default"
        size="icon-lg"
        className={CONTROL_BUTTON_CLASS}
        icon={<Plus className={ICON_CLASS} />}
        aria-label="Crear turno"
        title="Crear turno"
        onClick={onAddShift}
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
