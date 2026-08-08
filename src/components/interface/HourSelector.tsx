import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

/*
  src/components/interface/HourSelector.tsx
  Selector de hora en formato 24h (HH:mm). Los minutos sólo pueden ser
  00, 15, 30 o 45 y el valor predeterminado al abrir sin hora cargada
  es 00:00. Reemplaza al <input type="time"> nativo (que usaba el picker
  del navegador) por un popover con dos listas: horas (0-23) y minutos.

  Los límites min/max (en formato "HH:mm") deshabilitan las opciones que
  quedan fuera del rango, para guiar al usuario sin permitir rangos que se
  crucen (misma idea que los atributos nativos min/max del input time).
*/

interface HourSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
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
  'flex w-full min-w-0 flex-1 cursor-pointer items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-800 px-(--size-m) py-(--size-s) text-sm text-neutral-100 outline-none transition focus:border-neutral-400';

const POPOVER_CLASS =
  'absolute left-0 top-full z-50 mt-2 flex gap-(--size-m) rounded-2xl border border-neutral-700 bg-neutral-900 p-(--size-m) shadow-2xl';

const LIST_CLASS = 'flex max-h-56 flex-col gap-1 overflow-y-auto pr-1';

const OPTION_CLASS =
  'flex h-9 min-w-14 shrink-0 items-center justify-center rounded-lg text-sm transition';

function optionClass(selected: boolean, disabled: boolean): string {
  if (disabled) return `${OPTION_CLASS} cursor-not-allowed text-neutral-700`;
  if (selected) return `${OPTION_CLASS} bg-white/15 text-neutral-50`;
  return `${OPTION_CLASS} text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100`;
}

export default function HourSelector({ value, onChange, min, max, readOnly = false, className }: HourSelectorProps) {
  const [open, setOpen] = useState(false);
  const [draftHour, setDraftHour] = useState(0);
  const [draftMinute, setDraftMinute] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hour = value ? Number(value.split(':')[0]) : null;
  const minute = value ? Number(value.split(':')[1]) : null;
  const minTotal = toMinutes(min);
  const maxTotal = toMinutes(max);

  const isMinuteEnabled = (m: number) => {
    if (minTotal == null && maxTotal == null) return true;
    const total = draftHour * 60 + m;
    return (minTotal == null || total >= minTotal) && (maxTotal == null || total <= maxTotal);
  };

  const isHourEnabled = (h: number) =>
    MINUTES.some((m) => {
      if (minTotal == null && maxTotal == null) return true;
      const total = h * 60 + m;
      return (minTotal == null || total >= minTotal) && (maxTotal == null || total <= maxTotal);
    });

  const openPanel = () => {
    setDraftHour(hour ?? 0);
    setDraftMinute(minute);
    setOpen(true);
  };

  const closePanel = () => setOpen(false);

  const confirmSelection = (h: number, m: number) => {
    if (!isMinuteEnabled(m)) return;
    onChange?.(`${pad(h)}:${pad(m)}`);
    closePanel();
  };

  const pickMinute = (m: number) => {
    if (!isMinuteEnabled(m)) return;
    confirmSelection(draftHour, m);
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePanel();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
        type="button"
        className={twMerge(SELECTOR_CLASS, className)}
        onClick={openPanel}
      >
        {displayValue}
      </button>

      {open ? (
        <div className={POPOVER_CLASS}>
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
                    onClick={() => setDraftHour(h)}
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
        </div>
      ) : null}
    </div>
  );
}
