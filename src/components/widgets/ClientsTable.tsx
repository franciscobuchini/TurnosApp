/* 
  src/components/widgets/ClientsTable.tsx
  Esta tabla muestra la lista de clientes con sus datos y acciones disponibles.
*/

import Dropdown from '../interface/Dropdown';
import Table, { type TableColumn } from '../interface/Table';

type Client = {
  name: string;
  phone: string;
  appointmentsCount: number;
  totalSpent: number;
};

const clients: Client[] = [
  {
    name: 'Sofia Martinez',
    phone: '+54 9 11 2345-6789',
    appointmentsCount: 12,
    totalSpent: 145000,
  },
  {
    name: 'Lucas Perez',
    phone: '+54 9 11 3456-7890',
    appointmentsCount: 4,
    totalSpent: 38000,
  },
  {
    name: 'Valentina Gomez',
    phone: '+54 9 11 4567-8901',
    appointmentsCount: 8,
    totalSpent: 96500,
  },
];

/* currencyFormatter: formatea numeros como pesos argentinos, sin decimales */
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const columns: TableColumn<Client>[] = [
  {
    key: 'name',
    header: 'Cliente',
    cell: (client) => client.name,
    alignClassName: 'text-left',
    width: '30%',
  },
  {
    key: 'phone',
    header: 'Telefono',
    cell: (client) => client.phone,
    alignClassName: 'text-left',
    width: '15%',
  },
  {
    key: 'appointmentsCount',
    header: 'Turnos',
    cell: (client) => client.appointmentsCount,
    alignClassName: 'text-center',
    width: '10%',
  },
  {
    key: 'totalSpent',
    header: 'Gastado',
    cell: (client) => currencyFormatter.format(client.totalSpent),
    alignClassName: 'text-right',
    width: '15%',
  },
  {
    key: 'actions',
    header: '',
    cell: () => (
      <Dropdown
        content=":"
        items={[
          { label: 'Ver historial' },
          { label: 'WhatsApp' },
          { label: 'Eliminar cliente' },
        ]}
      />
    ),
    alignClassName: 'text-right',
    width: '5%',
  },
];

export default function ClientsTable() {
  return <Table columns={columns} rows={clients} rowHeightClassName="h-(--size-3xl)" />;
}