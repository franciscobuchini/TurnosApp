/*
  src/components/ui/current-time-line.tsx
  Línea que marca la hora actual, superpuesta sobre la columna de contenido del Schedule.
  Se muestra siempre que selectedDate sea el día de hoy y la hora actual caiga
  dentro de la ventana de filas que el Schedule efectivamente renderiza (no
  hace falta que esté en horario real de atención: el hueco de almuerzo o el
  colchón antes/después de abrir también son parte de esa ventana). Se
  actualiza sola con el paso del tiempo.
*/

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { isSameDay } from '@/utils/dateName';

interface CurrentTimeLineProps {
  selectedDate: Date;
  className?: string;
  /** Rango de slots (0-95) que el Schedule efectivamente renderiza: la línea
      se posiciona en relación a `windowStartSlot` y se oculta si la hora
      actual cae fuera de este rango (ej. de madrugada, con el negocio
      cerrado). */
  windowStartSlot: number;
  windowEndSlot: number;
}

const CURRENT_TIME_LINE_CLASS = 'absolute left-16 right-0 h-0.5 scroll-mt-4 pointer-events-none bg-muted-foreground rounded-full';

export default function CurrentTimeLine({
  selectedDate,
  className,
  windowStartSlot,
  windowEndSlot,
}: CurrentTimeLineProps) {
  const [now, setNow] = useState(new Date());
  const [lineTop, setLineTop] = useState<number | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const shouldScrollToLineRef = useRef(true);
  const isToday = isSameDay(selectedDate, now);
  const minutesElapsed = now.getHours() * 60 + now.getMinutes();
  const nowSlot = minutesElapsed / 15;
  const isWithinWindow = nowSlot >= windowStartSlot && nowSlot < windowEndSlot;

  const scrollToCurrentLine = () => {
    const line = lineRef.current;
    const scrollable = line?.closest<HTMLElement>('[data-schedule-scroll]');

    if (!line || !scrollable || scrollable.scrollHeight <= scrollable.clientHeight) return;

    const topMargin = scrollable.clientHeight * 0.1;
    const targetScroll = line.offsetTop - topMargin;
    scrollable.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    shouldScrollToLineRef.current = true;
  }, [selectedDate]);

  useLayoutEffect(() => {
    if (!isToday || !isWithinWindow || !lineRef.current) return;

    const container = lineRef.current.parentElement;
    const table = container?.querySelector('table');
    const headerRow = table?.querySelector('thead tr');
    const bodyRow = table?.querySelector('tbody tr');

    if (!table || !headerRow || !bodyRow) return;

    const headerHeight = headerRow.getBoundingClientRect().height;
    const rowHeight = bodyRow.getBoundingClientRect().height;

    if (!rowHeight) return;

    const slotIndex = minutesElapsed / 15 - windowStartSlot;
    const nextTop = headerHeight + slotIndex * rowHeight;

    setLineTop(nextTop);

    if (shouldScrollToLineRef.current) {
      shouldScrollToLineRef.current = false;
      window.requestAnimationFrame(scrollToCurrentLine);
    }
  }, [isToday, isWithinWindow, minutesElapsed, windowStartSlot]);

  if (!isToday || !isWithinWindow) return null;

  return (
    <div
      ref={lineRef}
      data-current-time-line
      className={twMerge(CURRENT_TIME_LINE_CLASS, className)}
      style={lineTop !== null ? { top: `${lineTop}px` } : undefined}
    />
  );
}
