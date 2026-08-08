/* 
  src/components/widgets/Schedule.tsx
  Vista diaria de la agenda, organizada por bloques horarios representados con una tabla.
  Estructura: 1 columna fija de horas (invariable) + X columnas de contenido,
  donde X es la cantidad de miembros del equipo seleccionados.
*/

import { twMerge } from 'tailwind-merge';
import Box from '../../interface/Box';
import Table, { type TableColumn } from '../../interface/Table';
import CurrentTimeLine from '../../interface/CurrentTimeLine';

interface ScheduleProps {
  selectedDate: Date;
  members: string[];
  className?: string;
}

const SCHEDULE_CLASS = 'relative flex flex-col flex-1 p-0 overflow-hidden rounded-3xl bg-neutral-900 shadow-xl';

const SCHEDULE_SCROLL_CLASS = 'flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

const SCHEDULE_CONTENT_CLASS = 'relative';

const SCHEDULE_TABLE_CLASS = '';

const SCHEDULE_TABLE_HEADER_CLASS = 'bg-neutral-900';

const SCHEDULE_ROW_HEIGHT_CLASS = 'h-(--size-2xl)';

const SCHEDULE_LABEL_CELL_CLASS = 'relative w-(--size-4xl) text-center';

const SCHEDULE_LABEL_TEXT_CLASS = 'absolute inset-x-0 -top-[5%] -translate-y-1/2 font-thin text-neutral-400 leading-none';

const SCHEDULE_LABEL_HEADER_CLASS = 'sr-only';

const SCHEDULE_SLOT_CELL_CLASS = 'border-t border-neutral-800/60';

const SCHEDULE_MEMBER_HEADER_CLASS = 'text-center text-sm font-medium truncate text-neutral-300';

const SCHEDULE_EMPTY_CLASS = 'absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-500 text-sm';

export default function Schedule({
  selectedDate,
  members,
  className,
}: ScheduleProps) {
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
    header: <span className={SCHEDULE_LABEL_HEADER_CLASS}>Horas</span>,
    width: 'var(--size-4xl)',
    cellClassName: SCHEDULE_LABEL_CELL_CLASS,
    cell: (slot, index) =>
      index === 0 ? '' : index % 4 === 0 ? <span className={SCHEDULE_LABEL_TEXT_CLASS}>{slot}</span> : '',
  };

  /* Una columna por cada miembro seleccionado. Si no hay ninguno,
     se usa una columna vacía sin bordes para mantener el layout. */
  const isEmpty = members.length === 0;

  const memberColumns: TableColumn<string>[] = isEmpty
    ? [{ key: 'empty', header: null, cell: () => null }]
    : members.map((member) => ({
        key: `member-${member}`,
        header: <span className={SCHEDULE_MEMBER_HEADER_CLASS}>{member}</span>,
        cellClassName: SCHEDULE_SLOT_CELL_CLASS,
        cell: () => null,
      }));

  const columns: TableColumn<string>[] = [labelColumn, ...memberColumns];

  return (
    <Box className={twMerge(SCHEDULE_CLASS, className)}>
      <div data-schedule-scroll className={SCHEDULE_SCROLL_CLASS}>
        <div className={SCHEDULE_CONTENT_CLASS}>
          <Table
            columns={columns}
            rows={slots}
            rowHeightClassName={SCHEDULE_ROW_HEIGHT_CLASS}
            className={SCHEDULE_TABLE_CLASS}
            headerClassName={SCHEDULE_TABLE_HEADER_CLASS}
            showHeader
            stickyHeader
          />
          {!isEmpty && <CurrentTimeLine selectedDate={selectedDate} />}
        </div>
      </div>
      {isEmpty && (
        <div className={SCHEDULE_EMPTY_CLASS}>
          No hay miembros del equipo seleccionados
        </div>
      )}
    </Box>
  );
}
