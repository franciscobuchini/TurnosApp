/* 
  src/components/widgets/Schedule.tsx
  Vista diaria de la agenda, organizada por bloques horarios representados con una tabla.
  Estructura: 1 columna fija de horas (invariable) + X columnas de contenido,
  donde X es la cantidad de miembros del equipo seleccionados.
*/

import { twMerge } from 'tailwind-merge';
import Box from '../../components/interface/Box';
import Table, { type TableColumn } from '../../components/interface/Table';
import CurrentTimeLine from '../interface/CurrentTimeLine';

interface ScheduleProps {
  selectedDate: Date;
  members: string[];
  className?: string;
}

/* ScheduleClasses: contenedor (Box)*/
const ScheduleClasses = {
  required: 'relative flex flex-col flex-1 p-0',
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

/* ScheduleSlotCellClasses: la celda del contenido de cada fila */
const ScheduleSlotCellClasses = {
  required: '',
  style: 'border-t border-l border-stone-200',
};

/* ScheduleMemberHeaderClasses: cabecera de cada columna de miembro */
const ScheduleMemberHeaderClasses = {
  required: 'text-center text-sm font-medium truncate',
  style: 'text-stone-600',
};

/* ScheduleEmptyClasses: overlay centrado que aparece cuando no hay miembros seleccionados */
const ScheduleEmptyClasses = {
  required: 'absolute inset-0 flex items-center justify-center pointer-events-none',
  style: 'text-stone-400 text-sm',
};

export default function Schedule({ selectedDate, members, className }: ScheduleProps) {
  const slots = Array.from({ length: 24 * 4 }, (_, index) => {
    const totalMinutes = index * 15;
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const displayHour = hour.toString().padStart(2, '0');
    const formattedMinutes = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`;
    return `${displayHour}${formattedMinutes} hs`;
  });

  /* Columna fija de etiquetas de hora: width explícito para que table-fixed no la incluya
     en el reparto equitativo — las columnas de miembros se dividen el espacio sobrante. */
  const labelColumn: TableColumn<string> = {
    key: 'label',
    header: <span className="sr-only">Horas</span>,
    width: 'var(--size-4xl)',
    cellClassName: twMerge(ScheduleLabelCellClasses.required, ScheduleLabelCellClasses.style),
    cell: (slot, index) =>
      index === 0 ? '' : index % 4 === 0 ? <span className="absolute inset-x-0 top-0 -translate-y-1/2">{slot}</span> : '',
  };

  /* Una columna por cada miembro seleccionado. Si no hay ninguno,
     se usa una columna vacía sin bordes para mantener el layout. */
  const isEmpty = members.length === 0;

  const memberColumns: TableColumn<string>[] = isEmpty
    ? [{ key: 'empty', header: null, cell: () => null }]
    : members.map((member) => ({
        key: `member-${member}`,
        header: <span className={twMerge(ScheduleMemberHeaderClasses.required, ScheduleMemberHeaderClasses.style)}>{member}</span>,
        cellClassName: twMerge(ScheduleSlotCellClasses.required, ScheduleSlotCellClasses.style),
        cell: () => null,
      }));

  const columns: TableColumn<string>[] = [labelColumn, ...memberColumns];

  return (
    <Box className={twMerge(ScheduleClasses.required, ScheduleClasses.style, className)}>
      <div data-schedule-scroll className={twMerge(ScheduleScrollClasses.required, ScheduleScrollClasses.style)}>
        <div className={twMerge(ScheduleContentClasses.required, ScheduleContentClasses.style)}>
          <Table
            columns={columns}
            rows={slots}
            rowHeightClassName={twMerge(ScheduleRowHeightClasses.required, ScheduleRowHeightClasses.style)}
            className={twMerge(ScheduleTableClasses.required, ScheduleTableClasses.style)}
          />
          {!isEmpty && <CurrentTimeLine selectedDate={selectedDate} />}
        </div>
      </div>
      {isEmpty && (
        <div className={twMerge(ScheduleEmptyClasses.required, ScheduleEmptyClasses.style)}>
          No hay miembros del equipo seleccionados
        </div>
      )}
    </Box>
  );
}