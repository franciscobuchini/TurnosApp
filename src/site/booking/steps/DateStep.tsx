/*
  src/site/booking/steps/DateStep.tsx
  Paso 2: elegir fecha. Tira horizontal de los próximos días en vez de un
  calendario mensual completo — más rápido de usar en mobile, que es donde
  se resuelve la mayoría de una reserva de este tipo. Los días sin horario
  de atención quedan deshabilitados; el mes se marca inline (arriba del
  primer día de cada mes visible) en vez de un header aparte, así no hace
  falta trackear qué mes está en pantalla al scrollear.

  Sin borde salvo el día elegido (fondo sólido) — nada de recuadros en cada
  día, sólo el fondo (hover / seleccionado) marca el estado. Hoy se destaca
  con el color primary del sitio (fondo suave, sin llegar al fondo sólido
  del seleccionado) para ubicarlo de un vistazo en la tira.
*/

import { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { getBusinessHoursByDay } from '@/hooks/useWeekSchedule';
import { getDayName, getMonthName, isSameDay } from '@/utils/dateName';
import { DATE_RANGE_DAYS, isDateAvailable } from '@/functions/bookingAvailability';
import type { OpeningHoursEntry } from '@/database/types';

interface DateStepProps {
  schedule: OpeningHoursEntry[];
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  serviceName?: string | null;
  durationMinutes?: number;
}

const SCROLL_STEP = 280;

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function DateStep({ schedule, selectedDate, onSelect, serviceName, durationMinutes }: DateStepProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hoursByDay = useMemo(() => getBusinessHoursByDay(schedule), [schedule]);
  const today = useMemo(() => startOfToday(), []);

  const days = useMemo(() => {
    return Array.from({ length: DATE_RANGE_DAYS }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() + index);
      const isOpen =
        serviceName && durationMinutes && durationMinutes > 0
          ? isDateAvailable(date, serviceName, durationMinutes)
          : (hoursByDay[date.getDay()] ?? []).length > 0;
      const showMonth = index === 0 || date.getDate() === 1;
      return { date, isOpen, showMonth };
    });
  }, [hoursByDay, today, serviceName, durationMinutes]);

  const scrollBy = (delta: number) => scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });

  return (
    <div className="relative flex items-center gap-1">
      <button
        type="button"
        onClick={() => scrollBy(-SCROLL_STEP)}
        aria-label="Días anteriores"
        className="hidden shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 text-(--site-text-muted) transition-colors hover:bg-(--site-bg) hover:text-(--site-text) sm:flex"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div
        ref={scrollerRef}
        className="flex flex-1 snap-x gap-2 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map(({ date, isOpen, showMonth }) => {
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={!isOpen}
              onClick={() => onSelect(date)}
              className={twMerge(
                'flex min-w-[4.5rem] shrink-0 snap-start flex-col items-center gap-1 rounded-(--site-radius) px-5 py-4 text-sm transition-colors',
                isOpen
                  ? 'cursor-pointer text-(--site-text) hover:bg-(--site-bg)'
                  : 'cursor-not-allowed text-(--site-text-muted) opacity-50',
                isToday && isOpen && !isSelected && 'bg-(--site-primary)/10 text-(--site-primary) hover:bg-(--site-primary)/15',
                isSelected && 'bg-(--site-primary) text-(--site-primary-foreground) hover:bg-(--site-primary)',
              )}
            >
              <span
                className={twMerge(
                  'h-3 text-[10px] leading-3 font-medium uppercase',
                  isSelected
                    ? 'text-(--site-primary-foreground)/80'
                    : isToday && isOpen
                      ? 'text-(--site-primary)/70'
                      : 'text-(--site-text-muted)',
                )}
              >
                {showMonth ? getMonthName(date, 3) : ''}
              </span>
              <span className="uppercase">{getDayName(date, 3)}</span>
              <span className={twMerge('text-lg font-semibold', !isOpen && 'line-through')}>{date.getDate()}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(SCROLL_STEP)}
        aria-label="Próximos días"
        className="hidden shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 text-(--site-text-muted) transition-colors hover:bg-(--site-bg) hover:text-(--site-text) sm:flex"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
