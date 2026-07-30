/* 
  src/components/widgets/ProductsTable.tsx
  Esta tabla muestra la lista de productos y servicios con sus datos y acciones disponibles.
*/

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Badge from '../interface/Badge';
import Dropdown from '../interface/Dropdown';
import Image from '../interface/Image';
import Table, { type TableColumn } from '../interface/Table';

type Product = {
  name: string;
  description: string;
  price: number;
  duration: string;
};

/* currencyFormatter: formatea numeros como pesos argentinos, sin decimales */
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const products: Product[] = [
  {
    name: 'Corte de Pelo Masculino',
    description: 'Corte clásico o moderno con lavado incluido y asesoramiento de imagen.',
    price: 8500,
    duration: '45 min',
  },
  {
    name: 'Recorte de Barba + Spa',
    description: 'Perfilado de barba con navaja, toallas calientes, aceites hidratantes y masaje facial.',
    price: 6000,
    duration: '30 min',
  },
  {
    name: 'Coloración y Reflejos',
    description: 'Tinte completo o reflejos con productos de alta calidad para cuidar la salud capilar.',
    price: 15000,
    duration: '90 min',
  },
];

/* ProductsTableInfoCellClasses: wrapper de la celda de info (imagen + texto) */
const ProductsTableInfoCellClasses = {
  required: 'flex items-center gap-4 py-1',
  style: '',
};

/* ProductsTableAvatarShapeClasses: forma de la imagen del producto, se pasa como className a Image */
const ProductsTableAvatarShapeClasses = {
  required: 'rounded-(--radius-s)',
  style: '',
};

/* ProductsTableInfoColumnClasses: columna de nombre, descripción y badges */
const ProductsTableInfoColumnClasses = {
  required: 'flex flex-col justify-center gap-(--size-3xs)',
  style: '',
};

/* ProductsTableDescriptionClasses: texto de la descripción */
const ProductsTableDescriptionClasses = {
  required: 'text-sm',
  style: '',
};

/* ProductsTableBadgeGroupClasses: wrapper de los badges de precio y duración */
const ProductsTableBadgeGroupClasses = {
  required: 'flex gap-(--size-2xs)',
  style: '',
};

/* ProductsTableActionsClasses: tamaño del trigger de acciones, se pasa como className a Dropdown */
const ProductsTableActionsClasses = {
  required: 'h-(--size-xl) w-(--size-xl)',
  style: '',
};

export default function ProductsTable() {
  const [activeStates, setActiveStates] = useState<boolean[]>(products.map(() => true));

  const toggleActive = (rowIndex: number) => {
    setActiveStates((prev) =>
      prev.map((isActive, index) => (index === rowIndex ? !isActive : isActive)),
    );
  };

  const columns: TableColumn<Product>[] = [
    {
      key: 'info',
      header: '',
      cell: (product) => (
        <div className={twMerge(ProductsTableInfoCellClasses.required, ProductsTableInfoCellClasses.style)}>
          <Image className={twMerge(ProductsTableAvatarShapeClasses.required, ProductsTableAvatarShapeClasses.style)} />
          <div className={twMerge(ProductsTableInfoColumnClasses.required, ProductsTableInfoColumnClasses.style)}>
            <span>{product.name}</span>
            <span className={twMerge(ProductsTableDescriptionClasses.required, ProductsTableDescriptionClasses.style)}>
              {product.description}
            </span>
            <div className={twMerge(ProductsTableBadgeGroupClasses.required, ProductsTableBadgeGroupClasses.style)}>
              <Badge>{currencyFormatter.format(product.price)}</Badge>
              <Badge>{product.duration}</Badge>
            </div>
          </div>
        </div>
      ),
      alignClassName: 'text-left',
      width: '90%',
    },
    {
      key: 'actions',
      header: '',
      cell: (_product, rowIndex) => (
        <Dropdown
          content=":"
          styleClassName={twMerge(ProductsTableActionsClasses.required, ProductsTableActionsClasses.style)}
          items={[
            { label: 'Ver info' },
            { label: 'Editar' },
            { label: 'Duplicar' },
            {
              label: activeStates[rowIndex] ? 'Desactivar' : 'Activar',
              onClick: () => toggleActive(rowIndex),
            },
            { label: 'Eliminar' },
          ]}
        />
      ),
      alignClassName: 'text-right',
      width: '10%',
    },
  ];

  return <Table columns={columns} rows={products} rowHeightClassName="h-(--size-5xl)" />;
}