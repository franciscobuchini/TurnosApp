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

const CURRENT_TIME_LINE_CLASS = 'absolute left-(--size-4xl) right-0 h-0.5 scroll-mt-(--size-m) pointer-events-none bg-(--primary-07) rounded-full shadow-[0_-4px_6px_rgba(50,50,50,0.2)]';

export default function CurrentTimeLine({
  selectedDate,
  className,
}: CurrentTimeLineProps) {
  const [now, setNow] = useState(new Date());
  const [lineTop, setLineTop] = useState<number | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const shouldScrollToLineRef = useRef(true);
  const isToday = isSameDay(selectedDate, now);

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

    if (shouldScrollToLineRef.current) {
      shouldScrollToLineRef.current = false;
      window.requestAnimationFrame(scrollToCurrentLine);
    }
  }, [isToday, now]);

  if (!isToday) return null;

  return (
    <div
      ref={lineRef}
      data-current-time-line
      className={twMerge(CURRENT_TIME_LINE_CLASS, className)}
      style={lineTop !== null ? { top: `${lineTop}px` } : undefined}
    />
  );
}
