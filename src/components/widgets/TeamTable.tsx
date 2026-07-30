/* 
  src/components/widgets/TeamTable.tsx
  Esta tabla muestra la lista de miembros del equipo con sus datos y acciones disponibles.
*/



import Badge from '../interface/Badge';
import Dropdown from '../interface/Dropdown';
import Image from '../interface/Image';
import Table, { type TableColumn } from '../interface/Table';

type DaySchedule = {
  day: string;
  hours: string[];
};

type TeamMember = {
  name: string;
  role: string;
  email: string;
  phone: string;
  services: string[];
  schedule: DaySchedule[] | string;
};

const teamMembers: TeamMember[] = [
  {
    name: 'Carlos Rodriguez',
    role: 'Peluquero',
    email: 'carlos@mail.com',
    phone: '+54 9 11 5678-1234',
    services: ['Corte', 'Barba', 'Coloración'],
    schedule: [
      { day: 'L', hours: ['9:00 - 18:00'] },
      { day: 'M', hours: ['9:00 - 18:00'] },
      { day: 'X', hours: ['9:00 - 18:00'] },
      { day: 'J', hours: ['9:00 - 18:00'] },
      { day: 'V', hours: ['9:00 - 18:00'] },
    ],
  },
  {
    name: 'Mariana Lopez',
    role: 'Estilista',
    email: 'mariana@mail.com',
    phone: '+54 9 11 6789-2345',
    services: ['Coloración', 'Reflejos'],
    schedule: [
      { day: 'M', hours: ['10:00 - 19:00'] },
      { day: 'X', hours: ['10:00 - 19:00'] },
      { day: 'J', hours: ['10:00 - 19:00'] },
      { day: 'V', hours: ['10:00 - 19:00'] },
      { day: 'S', hours: ['10:00 - 19:00'] },
    ],
  },
  {
    name: 'Diego Fernandez',
    role: 'Barbero',
    email: 'diego@mail.com',
    phone: '+54 9 11 7890-3456',
    services: ['Corte', 'Barba'],
    schedule: [
      { day: 'L', hours: ['8:00 - 12:00'] },
      { day: 'L', hours: ['14:00 - 18:00'] },
      { day: 'M', hours: ['8:00 - 16:00'] },
      { day: 'X', hours: ['8:00 - 16:00'] },
      { day: 'J', hours: ['8:00 - 12:00'] },
      { day: 'J', hours: ['14:00 - 18:00'] },
      { day: 'V', hours: ['8:00 - 16:00'] },
      { day: 'S', hours: ['8:00 - 12:00'] },
    ],
  },
  {
    name: 'Carlos Rodriguez',
    role: 'Peluquero',
    email: 'carlos@mail.com',
    phone: '+54 9 11 5678-1234',
    services: ['Corte', 'Barba', 'Coloración'],
    schedule: 'Sin horarios asignados',
  }
];

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
        <Image styleClassName="w-(--size-4xl) h-(--size-4xl)" className="rounded-full" />
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
        content=":"
        styleClassName="h-(--size-xl) w-(--size-xl)"
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
  return <Table columns={columns} rows={teamMembers} rowHeightClassName="h-(--size-5xl)" />;
}
