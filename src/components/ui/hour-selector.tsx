/*
  src/components/ui/hour-selector.tsx
  Selector de hora en formato 24h (HH:mm). Los minutos sólo pueden ser
  00, 15, 30 o 45 y el valor predeterminado al abrir sin hora cargada
  es 00:00. Reemplaza al <input type="time"> nativo (que usaba el picker
  del navegador) por un popover con dos listas: horas (0-23) y minutos.

  Los límites min/max (en formato "HH:mm") deshabilitan las opciones que
  quedan fuera del rango, para guiar al usuario sin permitir rangos que se
  crucen (misma idea que los atributos nativos min/max del input time).

  `businessHours` es la lista de tramos en los que el local está abierto ese
  día (de weekSchedule.ts): cualquier hora/minuto fuera de esos tramos queda
  deshabilitado, porque el local está cerrado. "00:00" debe leerse como
  medianoche; el cierre a las 00:00 del día siguiente se expresa "24:00".
*/

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import {
  isTimeWithinBusinessHours,
  type TimeRange,
} from '@/hooks/useWeekSchedule';

interface HourSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  businessHours?: TimeRange[];
  readOnly?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = [0, 15, 30, 45];

const pad = (n: number) => n.toString().padStart(2, '0');

function toMinutes(time?: string): number | null {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

const SELECTOR_CLASS =
  'flex h-9 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-2xl border border-border bg-input px-4 py-2 text-sm text-foreground outline-none focus:border-foreground';

const POPOVER_CLASS =
  'fixed z-[9999] flex gap-4 rounded-2xl border border-border bg-popover p-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150';

const LIST_CLASS = 'flex max-h-56 flex-col gap-1 overflow-y-auto pr-1';

const OPTION_CLASS =
  'flex h-9 min-w-14 shrink-0 items-center justify-center rounded-lg text-sm';

function optionClass(selected: boolean, disabled: boolean): string {
  if (disabled) return `${OPTION_CLASS} cursor-not-allowed text-muted-foreground/40`;
  if (selected) return `${OPTION_CLASS} bg-foreground/15 text-foreground`;
  return `${OPTION_CLASS} text-muted-foreground hover:bg-muted hover:text-foreground`;
}

export default function HourSelector({
  value,
  onChange,
  min,
  max,
  businessHours,
  readOnly = false,
  className,
}: HourSelectorProps) {
  const [open, setOpen] = useState(false);
  const [draftHour, setDraftHour] = useState(0);
  const [draftMinute, setDraftMinute] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const hour = value ? Number(value.split(':')[0]) : null;
  const minute = value ? Number(value.split(':')[1]) : null;
  const minTotal = toMinutes(min);
  const maxTotal = toMinutes(max);

  const isMinuteEnabledFor = (h: number, m: number) => {
    const total = h * 60 + m;
    if (minTotal != null && total < minTotal) return false;
    if (maxTotal != null && total > maxTotal) return false;
    return isTimeWithinBusinessHours(total, businessHours);
  };

  const isMinuteEnabled = (m: number) => isMinuteEnabledFor(draftHour, m);

  const isHourEnabled = (h: number) =>
    MINUTES.some((m) => {
      if (minTotal == null && maxTotal == null) {
        return isTimeWithinBusinessHours(h * 60 + m, businessHours);
      }
      const total = h * 60 + m;
      return (
        (minTotal == null || total >= minTotal) &&
        (maxTotal == null || total <= maxTotal) &&
        isTimeWithinBusinessHours(total, businessHours)
      );
    });

  const openPanel = () => {
    setDraftHour(hour ?? 0);
    setDraftMinute(minute);
    updatePopoverPosition();
    setOpen(true);
  };

  const closePanel = () => setOpen(false);

  // Ubica el popover (renderizado en un portal sobre document.body, ajeno a
  // cualquier overflow-hidden de los ancestros) en la posición del botón y lo
  // mantiene dentro de la ventana.
  const updatePopoverPosition = () => {
    const anchor = buttonRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const estimatedHeight = 340;

    const left = Math.min(
      Math.max(rect.left, 8),
      window.innerWidth - 8,
    );
    const top = Math.min(rect.bottom + 12, Math.max(8, window.innerHeight - estimatedHeight));

    setPopoverPosition({ top, left });
  };

  const confirmSelection = (h: number, m: number) => {
    if (!isMinuteEnabledFor(h, m)) return;
    onChange?.(`${pad(h)}:${pad(m)}`);
    closePanel();
  };

  const pickMinute = (m: number) => {
    confirmSelection(draftHour, m);
  };

  // Cambiar la hora ya deja guardado el horario (con el minuto actual, o
  // :00 si todavía no se eligió ninguno): si el usuario hace click afuera
  // del popover sin tocar los minutos, no se pierde la selección.
  const pickHour = (h: number) => {
    setDraftHour(h);
    const m = draftMinute ?? 0;
    if (isMinuteEnabledFor(h, m)) {
      onChange?.(`${pad(h)}:${pad(m)}`);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideContainer =
        containerRef.current?.contains(target) ?? false;
      const insidePopover = popoverRef.current?.contains(target) ?? false;
      if (!insideContainer && !insidePopover) {
        closePanel();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };

    const handleViewportChange = () => {
      updatePopoverPosition();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleViewportChange);
    document.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleViewportChange);
      document.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open]);

  // Ajusta el popover a la ventana una vez medido (sin reponerse en bucle:
  // el efecto corre solo al abrir y el set funcional devuelve el mismo objeto
  // si el clamp no cambió).
  useLayoutEffect(() => {
    if (!open) return;

    const popover = popoverRef.current;
    if (!popover) return;

    const rect = popover.getBoundingClientRect();
    setPopoverPosition((current) => {
      if (!current) return current;

      const top = Math.max(8, window.innerHeight - rect.height - 8);
      const left = Math.max(8, window.innerWidth - rect.width - 8);
      const nextTop = Math.min(current.top, top);
      const nextLeft = Math.min(current.left, left);

      if (nextTop === current.top && nextLeft === current.left) {
        return current;
      }
      return { top: nextTop, left: nextLeft };
    });
  }, [open]);

  const displayValue = open
    ? `${pad(draftHour)}:${pad(draftMinute ?? 0)}`
    : hour != null && minute != null
      ? `${pad(hour)}:${pad(minute)}`
      : '--:--';

  if (readOnly) {
    return (
      <div className={twMerge(SELECTOR_CLASS, 'cursor-default', className)}>
        {displayValue}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex min-w-0 flex-1">
      <button
        ref={buttonRef}
        type="button"
        className={twMerge(SELECTOR_CLASS, className)}
        onClick={openPanel}
      >
        {displayValue}
      </button>

      {open && popoverPosition
        ? createPortal(
          <div
            ref={popoverRef}
            className={POPOVER_CLASS}
            style={{ top: popoverPosition.top, left: popoverPosition.left }}
          >
            <div>
              <div className={LIST_CLASS}>
                {HOURS.map((h) => {
                  const enabled = isHourEnabled(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={!enabled}
                      className={optionClass(h === draftHour, !enabled)}
                      onClick={() => pickHour(h)}
                      onDoubleClick={() => confirmSelection(h, draftMinute ?? 0)}
                    >
                      {pad(h)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {MINUTES.map((m) => {
                const enabled = isMinuteEnabled(m);
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={!enabled}
                    className={optionClass(m === draftMinute, !enabled)}
                    onClick={() => pickMinute(m)}
                    onDoubleClick={() => confirmSelection(draftHour, m)}
                  >
                    {pad(m)}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
        : null}
    </div>
  );
}
