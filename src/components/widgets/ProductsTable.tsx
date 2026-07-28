/* 
  src/components/widgets/ProductsTable.tsx
  Esta tabla muestra la lista de productos y servicios con sus datos y acciones disponibles.
*/

import Dropdown from '../interface/Dropdown';
import Table, { type TableColumn } from '../interface/Table';
import Image from '../interface/Image';

type Product = {
  name: string;
  description: string;
};

const products: Product[] = [
  {
    name: 'Corte de Pelo Masculino',
    description: 'Corte clásico o moderno con lavado incluido y asesoramiento de imagen.',
  },
  {
    name: 'Recorte de Barba + Spa',
    description: 'Perfilado de barba con navaja, toallas calientes, aceites hidratantes y masaje facial.',
  },
  {
    name: 'Coloración y Reflejos',
    description: 'Tinte completo o reflejos con productos de alta calidad para cuidar la salud capilar.',
  },
];

const columns: TableColumn<Product>[] = [
  {
    key: 'info',
    header: 'Producto / Servicio',
    cell: (product) => (
      <div className="flex items-center gap-4 py-1">
        <Image />
        <div className="flex flex-col justify-center gap-(--size-3xs)">
          <span className="">{product.name}</span>
          <span className="text-xs">{product.description}</span>
          <span className="text-xs">(Espacio reservado para etiquetas)</span>
        </div>
      </div>
    ),
    alignClassName: 'text-left',
    width: '90%',
  },
  {
    key: 'actions',
    header: '',
    cell: () => (
      <Dropdown
        content=":"
        sizeClassName="h-(--size-xl) w-(--size-xl)"
        items={[
          { label: 'Editar producto' },
          { label: 'Eliminar producto' },
        ]}
      />
    ),
    alignClassName: 'text-right',
    width: '10%',
  },
];

export default function ProductsTable() {
  return <Table columns={columns} rows={products} rowHeightClassName="h-(--size-5xl)" />;
}
