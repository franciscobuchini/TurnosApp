/* 
  src/components/interface/CurrentTimeLine.tsx
  Línea que marca la hora actual, superpuesta sobre la columna de contenido del Schedule.
  Solo se muestra si selectedDate es el día de hoy; se actualiza sola con el paso del tiempo.
*/

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { isSameDay } from '../../functions/dateName';

interface CurrentTimeLineProps {
  selectedDate: Date;
  className?: string;
}

const MINUTES_IN_DAY = 24 * 60;

/* CurrentTimeLineClasses: línea horizontal, arranca después de la columna de horas y llega hasta el borde derecho */
const CurrentTimeLineClasses = {
  required: 'absolute left-(--size-4xl) right-0 h-0.5 pointer-events-none',
  style: 'bg-red-500',
};

export default function CurrentTimeLine({ selectedDate, className }: CurrentTimeLineProps) {
  const [now, setNow] = useState(new Date());
  const lineRef = useRef<HTMLDivElement>(null);
  const isToday = isSameDay(selectedDate, now);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /* Al mostrarse (carga inicial en el día de hoy, o al volver a hoy navegando),
     lleva el scroll del contenedor más cercano hasta la línea. */
  useEffect(() => {
    if (isToday) {
      lineRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [isToday]);

  if (!isToday) return null;

  const minutesElapsed = now.getHours() * 60 + now.getMinutes();
  const topPercent = (minutesElapsed / MINUTES_IN_DAY) * 100;

  return (
    <div
      ref={lineRef}
      className={twMerge(CurrentTimeLineClasses.required, CurrentTimeLineClasses.style, className)}
      style={{ top: `${topPercent}%` }}
    />
  );
}