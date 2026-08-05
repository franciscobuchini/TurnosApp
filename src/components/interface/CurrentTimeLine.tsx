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
  onReturnToToday?: (date: Date) => void;
  className?: string;
}

const IDLE_RETURN_DELAY = 5 * 60 * 1000;

/* CurrentTimeLineClasses: línea horizontal, arranca después de la columna de horas y llega hasta el borde derecho.
   scroll-mt-(--size-m): margen que respeta scrollIntoView, para que la línea no quede pegada al borde. */
const CurrentTimeLineClasses = {
  required: 'absolute left-(--size-4xl) right-0 h-0.5 scroll-mt-(--size-m) pointer-events-none',
  style: 'bg-gray-900 rounded-full',
};

export default function CurrentTimeLine({
  selectedDate,
  onReturnToToday,
  className,
}: CurrentTimeLineProps) {
  const [now, setNow] = useState(new Date());
  const [lineTop, setLineTop] = useState<number | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const returnTimeoutRef = useRef<number | null>(null);
  const previousNowRef = useRef(new Date());
  const autoScrollTimeoutRef = useRef<number | null>(null);
  const isAutoScrollingRef = useRef(false);
  const isFollowingLineRef = useRef(true);
  const shouldScrollToLineRef = useRef(true);
  const isToday = isSameDay(selectedDate, now);

  const scrollToCurrentLine = () => {
    const line = lineRef.current;
    const scrollable = line?.closest<HTMLElement>('[data-schedule-scroll]');

    if (!line || !scrollable || scrollable.scrollHeight <= scrollable.clientHeight) return;

    const topMargin = scrollable.clientHeight * 0.1;
    const targetScroll = line.offsetTop - topMargin;
    isAutoScrollingRef.current = true;
    scrollable.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });

    if (autoScrollTimeoutRef.current !== null) {
      window.clearTimeout(autoScrollTimeoutRef.current);
    }

    autoScrollTimeoutRef.current = window.setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 600);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextNow = new Date();
      const isMidnightCrossing =
        previousNowRef.current.getDate() !== nextNow.getDate() ||
        previousNowRef.current.getMonth() !== nextNow.getMonth() ||
        previousNowRef.current.getFullYear() !== nextNow.getFullYear();

      previousNowRef.current = nextNow;
      setNow(nextNow);

      if (isMidnightCrossing && selectedDate && isSameDay(selectedDate, nextNow)) {
        const scrollable = lineRef.current?.closest<HTMLElement>('[data-schedule-scroll]');
        scrollable?.scrollTo({ top: 0, behavior: 'smooth' });
        onReturnToToday?.(nextNow);
      }
    }, 60 * 1000);

    return () => window.clearInterval(interval);
  }, [onReturnToToday, selectedDate]);

  useEffect(() => {
    shouldScrollToLineRef.current = true;
  }, [selectedDate]);

  useEffect(() => {
    const clearReturnTimeout = () => {
      if (returnTimeoutRef.current === null) return;
      window.clearTimeout(returnTimeoutRef.current);
      returnTimeoutRef.current = null;
    };

    const scheduleReturnToToday = (isUserActivity = true) => {
      clearReturnTimeout();
      if (isUserActivity) {
        isFollowingLineRef.current = false;
      }

      returnTimeoutRef.current = window.setTimeout(() => {
        const today = new Date();
        isFollowingLineRef.current = true;
        shouldScrollToLineRef.current = true;
        onReturnToToday?.(today);

        window.requestAnimationFrame(scrollToCurrentLine);
      }, IDLE_RETURN_DELAY);
    };

    const handleUserScroll = () => {
      if (isAutoScrollingRef.current) return;
      scheduleReturnToToday();
    };

    const handleUserActivity = () => {
      scheduleReturnToToday();
    };

    const scrollable =
      lineRef.current?.closest<HTMLElement>('[data-schedule-scroll]') ??
      document.querySelector<HTMLElement>('[data-schedule-scroll]');

    scrollable?.addEventListener('scroll', handleUserScroll, { passive: true });
    window.addEventListener('pointerdown', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    scheduleReturnToToday(false);

    return () => {
      clearReturnTimeout();
      if (autoScrollTimeoutRef.current !== null) {
        window.clearTimeout(autoScrollTimeoutRef.current);
      }
      scrollable?.removeEventListener('scroll', handleUserScroll);
      window.removeEventListener('pointerdown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [onReturnToToday, selectedDate]);

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

    if (isFollowingLineRef.current || shouldScrollToLineRef.current) {
      shouldScrollToLineRef.current = false;
      window.requestAnimationFrame(scrollToCurrentLine);
    }
  }, [isToday, now]);

  if (!isToday) return null;

  return (
    <div
      ref={lineRef}
      data-current-time-line
      className={twMerge(CurrentTimeLineClasses.required, CurrentTimeLineClasses.style, className)}
      style={lineTop !== null ? { top: `${lineTop}px` } : undefined}
    />
  );
}
