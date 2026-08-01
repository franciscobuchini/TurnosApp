/* 
  src/components/widgets/Schedule.tsx
  Vista diaria de la agenda, organizada por bloques horarios representados con una tabla.
*/

import { twMerge } from 'tailwind-merge';
import Box from '../../components/interface/Box';
import Table, { type TableColumn } from '../../components/interface/Table';
import CurrentTimeLine from '../interface/CurrentTimeLine';

interface ScheduleProps {
  selectedDate: Date;
  className?: string;
}

/* ScheduleClasses: contenedor (Box)*/
const ScheduleClasses = {
  required: 'flex flex-col flex-1 p-0',
  style: 'rounded-3xl bg-white overflow-hidden',
};

/* ScheduleScrollClasses: wrapper que scrollea, altura fija por flex-1 */
const ScheduleScrollClasses = {
  required: 'flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
  style: '',
};

/* ScheduleContentClasses: wrapper relative que sí tiene la altura real de la tabla (crece con su contenido) */
const ScheduleContentClasses = {
  required: 'relative',
  style: '',
};

/* ScheduleTableClasses*/
const ScheduleTableClasses = {
  required: '',
  style: '',
};

/* ScheduleRowHeightClasses*/
const ScheduleRowHeightClasses = {
  required: 'h-(--size-2xl)',
  style: '',
};

/* ScheduleLabelCellClasses: la celda de la etiqueta de hora, relative para anclar el label */
const ScheduleLabelCellClasses = {
  required: 'relative w-(--size-4xl) text-center',
  style: '',
};

/* ScheduleSlotCellClasses: la celda del contenido de cada fila*/
const ScheduleSlotCellClasses = {
  required: '',
  style: 'border-t border-t-stone-200',
};

export default function Schedule({ selectedDate, className }: ScheduleProps) {
  const slots = Array.from({ length: 24 * 4 }, (_, index) => {
    const totalMinutes = index * 15;
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const displayHour = hour.toString().padStart(2, '0');
    const formattedMinutes = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`;
    return `${displayHour}${formattedMinutes} hs`;
  });

  const columns: TableColumn<string>[] = [
    {
      key: 'label',
      header: null,
      cellClassName: twMerge(ScheduleLabelCellClasses.required, ScheduleLabelCellClasses.style),
      cell: (slot, index) =>
        index === 0 ? '' : index % 4 === 0 ? <span className="absolute inset-x-0 top-0 -translate-y-1/2">{slot}</span> : '',
    },
    {
      key: 'slot',
      header: null,
      cellClassName: twMerge(ScheduleSlotCellClasses.required, ScheduleSlotCellClasses.style),
      cell: () => null,
    },
  ];

  return (
    <Box className={twMerge(ScheduleClasses.required, ScheduleClasses.style, className)}>
      <div className={twMerge(ScheduleScrollClasses.required, ScheduleScrollClasses.style)}>
        <div className={twMerge(ScheduleContentClasses.required, ScheduleContentClasses.style)}>
          <Table
            columns={columns}
            rows={slots}
            rowHeightClassName={twMerge(ScheduleRowHeightClasses.required, ScheduleRowHeightClasses.style)}
            className={twMerge(ScheduleTableClasses.required, ScheduleTableClasses.style)}
          />
          <CurrentTimeLine selectedDate={selectedDate} />
        </div>
      </div>
    </Box>
  );
}