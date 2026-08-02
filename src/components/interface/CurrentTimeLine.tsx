/* 
  src/components/interface/CurrentTimeLine.tsx
  Línea que marca la hora actual, superpuesta sobre la columna de contenido del Schedule.
  Solo se muestra si selectedDate es el día de hoy; se actualiza sola con el paso del tiempo.
*/

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { isSameDay } from '../../functions/dateName';

interface CurrentTimeLineProps {
  selectedDate: Date;
  className?: string;
}

/* CurrentTimeLineClasses: línea horizontal, arranca después de la columna de horas y llega hasta el borde derecho.
   scroll-mt-(--size-m): margen que respeta scrollIntoView, para que la línea no quede pegada al borde. */
const CurrentTimeLineClasses = {
  required: 'absolute left-(--size-4xl) right-0 h-0.5 scroll-mt-(--size-m) pointer-events-none',
  style: 'bg-red-500',
};

export default function CurrentTimeLine({ selectedDate, className }: CurrentTimeLineProps) {
  const [now, setNow] = useState(new Date());
  const [lineTop, setLineTop] = useState<number | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const isToday = isSameDay(selectedDate, now);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    if (!isToday || !lineRef.current) return;

    const container = lineRef.current.parentElement;
    const table = container?.querySelector('table');
    const headerRow = table?.querySelector('thead tr');
    const bodyRow = table?.querySelector('tbody tr');

    if (!table || !headerRow || !bodyRow) return;

    const headerHeight = headerRow.getBoundingClientRect().height;
    const rowHeight = bodyRow.getBoundingClientRect().height;

    if (!rowHeight) return;

    const minutesElapsed = now.getHours() * 60 + now.getMinutes();
    const slotIndex = minutesElapsed / 15;
    const nextTop = headerHeight + slotIndex * rowHeight;

    setLineTop(nextTop);

    lineRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [isToday, now]);

  if (!isToday) return null;

  return (
    <div
      ref={lineRef}
      className={twMerge(CurrentTimeLineClasses.required, CurrentTimeLineClasses.style, className)}
      style={lineTop !== null ? { top: `${lineTop}px` } : undefined}
    />
  );
}