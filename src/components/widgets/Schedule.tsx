/* 
  src/components/widgets/Schedule.tsx
  Vista diaria de la agenda, organizada por bloques horarios representados con bordes.
*/

import { twMerge } from 'tailwind-merge';
import Box from '../../components/interface/Box';

interface ScheduleProps {
  selectedDate: Date;
  className?: string;
  styleClassName?: string;
}

/* ScheduleClasses: contenedor (Box)*/
const ScheduleClasses = {
  required: 'flex flex-col gap-(--size-xl)',
  style: 'border border-black',
};

/* ScheduleGridClasses: wrapper de la grilla de horas*/
const ScheduleGridClasses = {
  required: 'flex flex-col',
  style: 'border border-black',
};

/* ScheduleRowClasses: cada fila de hora*/
const ScheduleRowClasses = {
  required: 'flex py-2 items-center',
  style: 'border-b border-black last:border-b-0',
};

/* ScheduleRowLabelClasses: la etiqueta de la hora*/
const ScheduleRowLabelClasses = {
  required: 'w-20 pr-4 text-right font-semibold',
  style: 'border-r border-black',
};

/* ScheduleRowSlotClasses: wrapper del contenido de cada fila*/
const ScheduleRowSlotClasses = {
  required: 'flex-1 pl-4 flex gap-2',
  style: '',
};

/* ScheduleEventBadgeClasses: el bloque de "Turno Reservado"*/
const ScheduleEventBadgeClasses = {
  required: 'flex-1 h-8 flex items-center justify-center text-sm',
  style: 'border border-dashed border-black',
};

/* ScheduleEmptySlotClasses: el espacio vacío cuando no hay turno*/
const ScheduleEmptySlotClasses = {
  required: 'flex-1 h-8',
  style: '',
};

export default function Schedule({ selectedDate, className, styleClassName }: ScheduleProps) {
  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  return (
    <Box
      className={twMerge(
        ScheduleClasses.required,
        styleClassName || ScheduleClasses.style,
        className,
      )}
    >

      {/* Agenda diaria (Bloques horarios) */}
      <div className={twMerge(ScheduleGridClasses.required, ScheduleGridClasses.style)}>
        {hours.map((hour, index) => {
          // Mostrar un turno de ejemplo diferente según el día seleccionado para simular datos reales
          const hasEvent = (selectedDate.getDate() + index) % 4 === 0;

          return (
            <div key={hour} className={twMerge(ScheduleRowClasses.required, ScheduleRowClasses.style)}>
              <div className={twMerge(ScheduleRowLabelClasses.required, ScheduleRowLabelClasses.style)}>
                {hour}
              </div>
              <div className={twMerge(ScheduleRowSlotClasses.required, ScheduleRowSlotClasses.style)}>
                {hasEvent ? (
                  <div className={twMerge(ScheduleEventBadgeClasses.required, ScheduleEventBadgeClasses.style)}>
                    Turno Reservado ({hour})
                  </div>
                ) : (
                  <div className={twMerge(ScheduleEmptySlotClasses.required, ScheduleEmptySlotClasses.style)} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
}