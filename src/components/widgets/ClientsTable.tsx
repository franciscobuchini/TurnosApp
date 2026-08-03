/* 
  src/components/widgets/ClientsTable.tsx
  Esta tabla muestra la lista de clientes con sus datos y acciones disponibles.
*/

import { Ellipsis } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Dropdown from '../interface/Dropdown';
import Image from '../interface/Image';
import Table, { type TableColumn } from '../interface/Table';
import type { Client } from '../../variables/types.ts';
import { getClients, currencyFormatter } from '../../variables/data.ts';

const clients = getClients();

const ClientsTableActionsClasses = {
  required: 'h-(--size-xl) w-(--size-xl)',
  style: '',
};

const columns: TableColumn<Client>[] = [
  {
    key: 'avatar',
    header: '',
    cell: (client) => (
      <Image src={client.photo} name={client.name} className="w-(--size-xl) h-(--size-xl) rounded-full" />
    ),
    alignClassName: 'text-left',
    width: '5%',
  },
  {
    key: 'name',
    header: 'Cliente',
    cell: (client) => client.name,
    alignClassName: 'text-left',
    width: '25%',
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
        content={<Ellipsis size={14} />}
        iconOnly="left"
        className={twMerge(ClientsTableActionsClasses.required, ClientsTableActionsClasses.style)}
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
