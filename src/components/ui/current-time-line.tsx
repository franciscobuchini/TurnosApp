/*
  src/components/ui/current-time-line.tsx
  Línea que marca la hora actual, superpuesta sobre la columna de contenido del Schedule.
  Se muestra siempre que selectedDate sea el día de hoy y la hora actual caiga
  dentro de la ventana de filas que el Schedule efectivamente renderiza (no
  hace falta que esté en horario real de atención: el hueco de almuerzo o el
  colchón antes/después de abrir también son parte de esa ventana). Se
  actualiza sola con el paso del tiempo.

  Además de la línea, cubre todo lo que queda por encima (el tiempo ya
  pasado) con la misma "niebla" que BlockedCell (ver SCHEDULE_FOG_CLASS):
  ahí es donde más se nota, porque es la única forma de aplicarla también
  sobre las AppointmentCard de turnos ya pasados (BlockedCell solo se
  renderiza en celdas vacías, nunca donde ya hay un turno).

  Si "ahora" ya pasó por completo la ventana visible (ej. de noche, con el
  negocio cerrado hace rato), la línea no tiene dónde pararse pero el día
  entero sigue siendo pasado: la niebla cubre toda la ventana igual, sin
  línea. Si "ahora" es anterior a la ventana (madrugada, antes del colchón
  de apertura), todavía no pasó nada — no se muestra ninguna de las dos.
*/

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { isSameDay } from '@/utils/dateName';
import { SCHEDULE_FOG_CLASS } from '@/components/widgets/mainWidgets/BlockedCell';

interface CurrentTimeLineProps {
  selectedDate: Date;
  className?: string;
  /** Rango de slots (0-95) que el Schedule efectivamente renderiza: la línea
      se posiciona en relación a `windowStartSlot` y se oculta si la hora
      actual cae fuera de este rango (ej. de madrugada, con el negocio
      cerrado). */
  windowStartSlot: number;
  windowEndSlot: number;
  /** Alto de fila actual (ver src/functions/scheduleZoom.ts): no se usa para
      calcular la posición (se mide el alto real renderizado), solo dispara
      que se vuelva a medir cuando cambia el zoom. */
  rowHeightPx: number;
}

const CURRENT_TIME_LINE_CLASS = 'absolute left-16 right-0 h-0.5 scroll-mt-4 pointer-events-none bg-muted-foreground rounded-full';

/* Capa sobre todo lo que ya pasó (desde arriba hasta la línea de hora
   actual): la misma niebla de BlockedCell. z-20 (no z-30): por debajo del
   header sticky de la tabla, para no taparlo al scrollear. */
const PAST_TIME_OVERLAY_CLASS = twMerge(
  'absolute left-16 right-0 top-0 z-20 pointer-events-none',
  SCHEDULE_FOG_CLASS,
);

export default function CurrentTimeLine({
  selectedDate,
  className,
  windowStartSlot,
  windowEndSlot,
  rowHeightPx,
}: CurrentTimeLineProps) {
  const [now, setNow] = useState(new Date());
  const [lineTop, setLineTop] = useState<number | null>(null);
  const [fullWindowHeight, setFullWindowHeight] = useState<number | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const shouldScrollToLineRef = useRef(true);
  const isToday = isSameDay(selectedDate, now);
  const minutesElapsed = now.getHours() * 60 + now.getMinutes();
  const nowSlot = minutesElapsed / 15;
  const isBeforeWindow = nowSlot < windowStartSlot;
  const isAfterWindow = nowSlot >= windowEndSlot;
  const isWithinWindow = !isBeforeWindow && !isAfterWindow;

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

  /* Se mide siempre a partir de un ancla propia (no de lineRef): la línea
     solo se renderiza cuando "ahora" cae adentro de la ventana, pero la
     niebla necesita medir igual cuando "ahora" ya la pasó de largo. */
  useLayoutEffect(() => {
    if (!isToday || isBeforeWindow || !anchorRef.current) return;

    const container = anchorRef.current.parentElement;
    const table = container?.querySelector('table');
    const headerRow = table?.querySelector('thead tr');
    const bodyRow = table?.querySelector('tbody tr');

    if (!table || !headerRow || !bodyRow) return;

    const headerHeight = headerRow.getBoundingClientRect().height;
    const rowHeight = bodyRow.getBoundingClientRect().height;

    if (!rowHeight) return;

    const totalSlots = windowEndSlot - windowStartSlot;
    setFullWindowHeight(headerHeight + totalSlots * rowHeight);

    if (isWithinWindow) {
      const slotIndex = minutesElapsed / 15 - windowStartSlot;
      setLineTop(headerHeight + slotIndex * rowHeight);

      if (shouldScrollToLineRef.current) {
        shouldScrollToLineRef.current = false;
        window.requestAnimationFrame(scrollToCurrentLine);
      }
    } else {
      setLineTop(null);
    }
  }, [isToday, isBeforeWindow, isWithinWindow, minutesElapsed, windowStartSlot, windowEndSlot, rowHeightPx]);

  if (!isToday || isBeforeWindow) return null;

  const overlayHeight = isWithinWindow ? lineTop : fullWindowHeight;

  return (
    <>
      <div ref={anchorRef} className="absolute top-0 left-0 h-0 w-0" aria-hidden />
      {overlayHeight !== null && (
        <div data-past-time-overlay className={PAST_TIME_OVERLAY_CLASS} style={{ height: `${overlayHeight}px` }} />
      )}
      {isWithinWindow && (
        <div
          ref={lineRef}
          data-current-time-line
          className={twMerge(CURRENT_TIME_LINE_CLASS, className)}
          style={lineTop !== null ? { top: `${lineTop}px` } : undefined}
        />
      )}
    </>
  );
}
