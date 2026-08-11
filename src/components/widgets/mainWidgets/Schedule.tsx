/* 
  src/components/widgets/Schedule.tsx
  Vista diaria de la agenda, organizada por bloques horarios representados con una tabla.
  Estructura: 1 columna fija de horas (invariable) + X columnas de contenido,
  donde X es la cantidad de miembros del equipo seleccionados.
*/

import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from '@/components/ui/box';
import Image from '@/components/ui/image';
import { Table, type TableColumn } from '@/components/ui/table';
import CurrentTimeLine from '@/components/ui/current-time-line';
import { getAppointmentsByDate, getservices, getTeamMembers } from '@/database/data';
import type { Appointment } from '@/database/types';
import { SERVICE_COLOR_BY_ID } from '@/components/widgets/serviceWidgets/serviceColors';
import AppointmentCard from './AppointmentCard';

interface ScheduleProps {
  selectedDate: Date;
  members: string[];
  className?: string;
}

const SCHEDULE_CLASS = 'relative flex flex-col flex-1 p-0 overflow-hidden rounded-3xl bg-card';

const SCHEDULE_SCROLL_CLASS = 'flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

const SCHEDULE_CONTENT_CLASS = 'relative';

const SCHEDULE_TABLE_CLASS = '';

const SCHEDULE_TABLE_HEADER_CLASS = 'bg-card';

const SCHEDULE_ROW_HEIGHT_CLASS = 'h-12';

const SCHEDULE_LABEL_CELL_CLASS = 'relative w-16 text-center';

const SCHEDULE_LABEL_TEXT_CLASS = 'absolute inset-x-0 -top-[5%] -translate-y-1/2 font-thin text-muted-foreground leading-none';

const SCHEDULE_LABEL_HEADER_CLASS = 'sr-only';

const SCHEDULE_SLOT_CELL_CLASS = 'border-t border-border/25 relative group/cell';

const SCHEDULE_MEMBER_HEADER_CLASS = 'flex items-center justify-center gap-2 text-sm font-medium truncate text-muted-foreground';

const SCHEDULE_MEMBER_IMAGE_CLASS = 'h-8 w-8 shrink-0 text-xs';

const SCHEDULE_EMPTY_CLASS = 'absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-sm';

const SCHEDULE_ADD_HINT_CLASS = 'absolute inset-1 flex items-center justify-center rounded-2xl text-sm text-muted-foreground/0 border border-dashed border-transparent group-hover/cell:text-muted-foreground group-hover/cell:border-muted-foreground transition-colors cursor-pointer select-none';

/* ── Helpers ────────────────────────────────────────────────── */

/** Convierte "HH:mm" en índice de slot de 15 min (0-95). */
function timeToSlotIndex(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 4 + Math.floor(m / 15);
}

/** Mapa: member -> slotIndex -> appointment (solo el primer slot de cada turno). */
function buildAppointmentMap(appointments: Appointment[]) {
  const map = new Map<string, Map<number, { appointment: Appointment; spanSlots: number }>>();

  for (const apt of appointments) {
    const startSlot = timeToSlotIndex(apt.startTime);
    const endSlot = timeToSlotIndex(apt.endTime);
    const spanSlots = Math.max(endSlot - startSlot, 1);

    if (!map.has(apt.member)) {
      map.set(apt.member, new Map());
    }
    map.get(apt.member)!.set(startSlot, { appointment: apt, spanSlots });
  }

  return map;
}

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

  const appointments = useMemo(() => getAppointmentsByDate(selectedDate), [selectedDate]);
  const appointmentMap = useMemo(() => buildAppointmentMap(appointments), [appointments]);

  /* Mapa servicio → color/foto y miembro → foto, para pintar cada tarjeta
     con el color del servicio y mostrar los avatares correspondientes. */
  const serviceColorMap = useMemo(() => {
    const services = getservices();
    const map: Record<string, string> = {};
    for (const s of services) {
      if (s.colorId) {
        map[s.name] = SERVICE_COLOR_BY_ID[s.colorId]?.className ?? '';
      }
    }
    return map;
  }, []);

  const servicePhotoMap = useMemo(() => {
    const services = getservices();
    const map: Record<string, string> = {};
    for (const s of services) {
      if (s.photo) map[s.name] = s.photo;
    }
    return map;
  }, []);

  const memberPhotoMap = useMemo(() => {
    const teamMembers = getTeamMembers();
    const map: Record<string, string> = {};
    for (const m of teamMembers) {
      if (m.photo) map[m.name] = m.photo;
    }
    return map;
  }, []);

  /* Columna fija de etiquetas de hora: width explícito para que table-fixed no la incluya
     en el reparto equitativo — las columnas de miembros se dividen el espacio sobrante. */
  const labelColumn: TableColumn<string> = {
    key: 'label',
    header: <span className={SCHEDULE_LABEL_HEADER_CLASS}>Horas</span>,
    width: '64px',
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
        header: (
          <span className={SCHEDULE_MEMBER_HEADER_CLASS}>
            <Image src={memberPhotoMap[member]} name={member} className={SCHEDULE_MEMBER_IMAGE_CLASS} />
            {member}
          </span>
        ),
        cellClassName: SCHEDULE_SLOT_CELL_CLASS,
        cell: (_slot: string, rowIndex: number) => {
          const memberMap = appointmentMap.get(member);

          const entry = memberMap?.get(rowIndex);
          if (!entry) {
            return <span className={SCHEDULE_ADD_HINT_CLASS}>+ Agregar turno</span>;
          }

          const { appointment, spanSlots } = entry;
          const colorClassName = serviceColorMap[appointment.service] || undefined;

          return (
            <AppointmentCard
              appointment={appointment}
              spanSlots={spanSlots}
              colorClassName={colorClassName}
              servicePhoto={servicePhotoMap[appointment.service]}
            />
          );
        },
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

