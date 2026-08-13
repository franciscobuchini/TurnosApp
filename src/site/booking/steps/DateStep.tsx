/*
  src/site/booking/steps/DateStep.tsx
  Paso 2: elegir fecha. Tira horizontal de los próximos días en vez de un
  calendario mensual completo — más rápido de usar en mobile, que es donde
  se resuelve la mayoría de una reserva de este tipo. Los días sin horario
  de atención quedan deshabilitados; el mes se marca inline (arriba del
  primer día de cada mes visible) en vez de un header aparte, así no hace
  falta trackear qué mes está en pantalla al scrollear.
*/

import { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { getBusinessHoursByDay } from '@/hooks/useWeekSchedule';
import { getDayName, getMonthName, isSameDay } from '@/utils/dateName';
import { DATE_RANGE_DAYS } from '@/functions/bookingAvailability';
import type { OpeningHoursEntry } from '@/database/types';

interface DateStepProps {
  schedule: OpeningHoursEntry[];
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

const SCROLL_STEP = 280;

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function DateStep({ schedule, selectedDate, onSelect }: DateStepProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hoursByDay = useMemo(() => getBusinessHoursByDay(schedule), [schedule]);
  const today = useMemo(() => startOfToday(), []);

  const days = useMemo(() => {
    return Array.from({ length: DATE_RANGE_DAYS }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() + index);
      const isOpen = (hoursByDay[date.getDay()] ?? []).length > 0;
      const showMonth = index === 0 || date.getDate() === 1;
      return { date, isOpen, showMonth };
    });
  }, [hoursByDay, today]);

  const scrollBy = (delta: number) => scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });

  return (
    <div className="relative flex items-center gap-1">
      <button
        type="button"
        onClick={() => scrollBy(-SCROLL_STEP)}
        aria-label="Días anteriores"
        className="hidden shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--site-border) p-1.5 text-(--site-text-muted) hover:text-(--site-text) sm:flex"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div
        ref={scrollerRef}
        className="flex flex-1 snap-x gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                'relative flex min-w-16 shrink-0 snap-start flex-col items-center gap-1 rounded-(--site-radius) border px-5 py-3.5 text-sm transition-colors',
                isOpen
                  ? 'cursor-pointer border-(--site-border) hover:bg-(--site-bg)'
                  : 'cursor-not-allowed border-(--site-border)/40 text-(--site-text-muted) opacity-50',
                isSelected && 'border-(--site-primary) bg-(--site-primary) text-(--site-primary-foreground)',
              )}
            >
              <span className="h-3 text-[10px] leading-3 font-medium uppercase text-(--site-text-muted)">
                {showMonth ? getMonthName(date, 3) : ''}
              </span>
              <span className="uppercase">{getDayName(date, 3)}</span>
              <span className={twMerge('text-lg font-semibold', !isOpen && 'line-through')}>{date.getDate()}</span>

              {isToday && !isSelected && (
                <span className="absolute bottom-1.5 size-1 rounded-full bg-(--site-primary)" />
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(SCROLL_STEP)}
        aria-label="Próximos días"
        className="hidden shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--site-border) p-1.5 text-(--site-text-muted) hover:text-(--site-text) sm:flex"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
