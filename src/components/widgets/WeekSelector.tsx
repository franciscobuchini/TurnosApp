/* 
  src/components/widgets/WeekSelector.tsx
*/

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';
import { getDayName, isSameDay } from '../../functions/dateName';

interface WeekSelectorProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  className?: string;
  prevButtonClassName?: string;
  nextButtonClassName?: string;
}

/* WeekSelectorClasses*/
const WeekSelectorClasses = {
  required: 'flex w-full items-center justify-between',
  style: '',
};

/* WeekSelectorDaysClasses: wrapper de los 7 botones de día.
   @container: establece el contexto de container query — los botones adentro
   miden el ancho de ESTE div, no el viewport. */
const WeekSelectorDaysClasses = {
  required: '@container flex flex-1 justify-around gap-(--size-xs) px-(--size-xs)',
  style: '',
};

/* WeekSelectorNavButtonClasses: botones de flecha prev/next, comparten el mismo look. shrink-0: nunca se comprimen. */
const WeekSelectorNavButtonClasses = {
  required: 'h-(--size-6xl) w-(--size-4xl) shrink-0',
  style: 'rounded-2xl',
};

/* WeekSelectorDayButtonClasses: botones de día, pasado como prop height a Button */
const WeekSelectorDayButtonClasses = {
  required: 'h-(--size-6xl) flex-1',
  style: 'rounded-2xl',
};

/* WeekSelectorDaySelectedClasses: estado activo del botón de día (el que clickeó el usuario), pisa el style default de Button */
const WeekSelectorDaySelectedClasses = {
  required: '',
  style: 'bg-stone-900 text-white rounded-2xl',
};

/* WeekSelectorDayTodayClasses: estado del botón cuando ese día es hoy, pero no está seleccionado */
const WeekSelectorDayTodayClasses = {
  required: '',
  style: 'ring-2 ring-stone-900 rounded-2xl',
};

/* WeekSelectorDayVisibilityClasses: cuántos días se ven según el ANCHO DEL CONTENEDOR (no el viewport),
   medido por distancia al día central. distancia 0 = día central (siempre visible),
   1 = ±1 día (desde 380px de contenedor: 3 días), 2 = ±2 días (desde 620px: 5 días),
   3 = ±3 días (desde 840px: 7 días). */
const WeekSelectorDayVisibilityClasses: Record<number, { required: string; style: string }> = {
  0: { required: '', style: '' },
  1: { required: 'hidden @min-[380px]:flex', style: '' },
  2: { required: 'hidden @min-[620px]:flex', style: '' },
  3: { required: 'hidden @min-[840px]:flex', style: '' },
};

/* WeekSelectorDayColumnClasses: wrapper interno que pone nombre y número en columna */
const WeekSelectorDayColumnClasses = {
  required: 'flex flex-col items-center',
  style: '',
};

/* WeekSelectorDayLabelClasses: nombre completo del día (Lunes, Martes...) */
const WeekSelectorDayLabelClasses = {
  required: 'text-l',
  style: '',
};

/* WeekSelectorDayNumberClasses: número del día, mucho más grande que el label */
const WeekSelectorDayNumberClasses = {
  required: 'text-4xl font-semibold px-(--size-2xs)',
  style: '',
};

export default function WeekSelector({
  weekDays,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  className,
  prevButtonClassName,
  nextButtonClassName,
}: WeekSelectorProps) {
  const centerIdx = Math.floor(weekDays.length / 2);

  return (
    <div className={twMerge(WeekSelectorClasses.required, WeekSelectorClasses.style, className)}>
      <Button
        onClick={onPrevWeek}
        iconOnly="right"
        className={twMerge(WeekSelectorNavButtonClasses.required, WeekSelectorNavButtonClasses.style, prevButtonClassName)}
      >
        <ChevronLeft />
      </Button>

      <div className={twMerge(WeekSelectorDaysClasses.required, WeekSelectorDaysClasses.style)}>
        {weekDays.map((date, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const distance = Math.abs(idx - centerIdx);
          const visibility = WeekSelectorDayVisibilityClasses[distance];

          return (
            <Button
              key={idx}
              onClick={() => onSelectDate(date)}
              className={twMerge(
                WeekSelectorDayButtonClasses.required,
                WeekSelectorDayButtonClasses.style,
                visibility.required,
                visibility.style,
                isSelected
                  ? twMerge(WeekSelectorDaySelectedClasses.required, WeekSelectorDaySelectedClasses.style)
                  : isToday
                    ? twMerge(WeekSelectorDayTodayClasses.required, WeekSelectorDayTodayClasses.style)
                    : '',
              )}
            >
              <span className={twMerge(WeekSelectorDayColumnClasses.required, WeekSelectorDayColumnClasses.style)}>
                <span className={twMerge(WeekSelectorDayLabelClasses.required, WeekSelectorDayLabelClasses.style)}>
                  {getDayName(date)}
                </span>
                <span className={twMerge(WeekSelectorDayNumberClasses.required, WeekSelectorDayNumberClasses.style)}>
                  {date.getDate()}
                </span>
              </span>
            </Button>
          );
        })}
      </div>

      <Button
        onClick={onNextWeek}
        iconOnly="left"
        className={twMerge(WeekSelectorNavButtonClasses.required, WeekSelectorNavButtonClasses.style, nextButtonClassName)}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}