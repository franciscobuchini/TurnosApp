/* 
  src/components/widgets/TeamTable.tsx
  Esta tabla muestra la lista de miembros del equipo con sus datos y acciones disponibles.
*/



import { Ellipsis } from 'lucide-react';
import Badge from '../interface/Badge';
import Dropdown from '../interface/Dropdown';
import Image from '../interface/Image';
import Table, { type TableColumn } from '../interface/Table';
import type { TeamMember, DaySchedule } from '../../variables/types.ts';
import { getTeamMembers } from '../../variables/data.ts';

const teamMembers = getTeamMembers();

function calculateWeeklyHours(schedule: DaySchedule[] | string): string {
  if (typeof schedule === 'string') {
    return schedule;
  }

  let totalHours = 0;
  for (const daySchedule of schedule) {
    for (const range of daySchedule.hours) {
      const [start, end] = range.split('-').map((t) => t.trim());
      if (start && end) {
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        const startTotal = startHour + (startMin || 0) / 60;
        const endTotal = endHour + (endMin || 0) / 60;
        totalHours += endTotal - startTotal;
      }
    }
  }

  return `${totalHours} hs semanales`;
}

const columns: TableColumn<TeamMember>[] = [
  {
    key: 'name',
    header: 'Nombre',
    cell: (member) => (
      <div className="flex items-center gap-4 py-1">
        <Image className="w-(--size-5xl) h-(--size-5xl) rounded-full" />
        <div className="flex flex-col justify-center gap-(--size-3xs)">
          <span>{member.name}</span>
          <span className="text-sm">{member.role}</span>
        </div>
      </div>
    ),
    alignClassName: 'text-left',
    width: '25%',
  },
  {
    key: 'contact',
    header: 'Contacto',
    cell: (member) => (
      <div className="flex flex-col justify-center gap-(--size-3xs)">
        <span className="text-sm">{member.email}</span>
        <span className="text-sm">{member.phone}</span>
      </div>
    ),
    alignClassName: 'text-left',
    width: '20%',
  },
  {
    key: 'services',
    header: 'Servicios',
    cell: (member) => (
      <div className="flex flex-wrap gap-(--size-2xs)">
        {member.services.map((service) => (
          <Badge key={service}>{service}</Badge>
        ))}
      </div>
    ),
    alignClassName: 'text-left',
    width: '25%',
  },
  {
    key: 'schedule',
    header: 'Horas',
    cell: (member) => (
      <div className="flex flex-wrap gap-(--size-2xs)">
        <Badge>{calculateWeeklyHours(member.schedule)}</Badge>
      </div>
    ),
    alignClassName: 'text-left',
    width: '25%',
  },
  {
    key: 'actions',
    header: '',
    cell: () => (
      <Dropdown
        content={<Ellipsis size={14} />}
        iconOnly="left"
        className="h-(--size-xl) w-(--size-xl)"
        items={[
          { label: 'Ver perfil' },
          { label: 'Ver agenda' },
          { label: 'Configurar' },
          { label: 'Eliminar' },
        ]}
      />
    ),
    alignClassName: 'text-right',
    width: '5%',
  },
];

export default function TeamTable() {
  return <Table columns={columns} rows={teamMembers} rowHeightClassName="h-(--size-6xl)" />;
}
