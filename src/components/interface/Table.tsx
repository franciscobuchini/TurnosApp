/* 
  src/components/interface/Table.tsx
  Componente de tabla genérico que se puede utilizar para mostrar datos en forma de tabla.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from './Box';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, rowIndex: number) => ReactNode;
  className?: string;
  alignClassName?: string;
  headerClassName?: string;
  cellClassName?: string | ((row: T, rowIndex: number) => string);
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowHeightClassName: string;
  className?: string;
}

/* TableClasses:
   - required: estructura. No varía.
   - style: color. Esto sí se puede modificar. */
const TableClasses = {
  required: 'w-full table-fixed',
  style: '',
};

/* Consts sueltos de la tabla, ya preparados con required/style separados
   para cuando se agregue color a cada uno. */
const DefaultCellClasses = {
  required: 'align-middle',
  style: '',
};

const HeaderRowClasses = {
  required: 'h-(--size-2xl)',
  style: '',
};

const BodyRowClasses = {
  required: '',
  style: '',
};

const HeaderCellClasses = {
  required: 'px-(--size-s)',
  style: '',
};

const BodyCellClasses = {
  required: 'px-(--size-s)',
  style: '',
};

export default function Table<T>({
  columns,
  rows,
  rowHeightClassName,
  className = '',
}: TableProps<T>) {
  return (
    <Box>
      <table className={twMerge(TableClasses.required, TableClasses.style, className)}>
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={column.width ? { width: column.width } : undefined} />
          ))}
        </colgroup>
        {columns.some((column) => column.header) && (
          <thead>
            <tr className={twMerge(rowHeightClassName, HeaderRowClasses.required, HeaderRowClasses.style)}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={twMerge(
                    DefaultCellClasses.required,
                    DefaultCellClasses.style,
                    HeaderCellClasses.required,
                    HeaderCellClasses.style,
                    column.alignClassName,
                    column.className,
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={twMerge(BodyRowClasses.required, BodyRowClasses.style, rowHeightClassName)}>
              {columns.map((column) => {
                const resolvedCellClassName = typeof column.cellClassName === 'function'
                  ? column.cellClassName(row, rowIndex)
                  : column.cellClassName;

                return (
                  <td
                    key={column.key}
                    className={twMerge(
                      DefaultCellClasses.required,
                      DefaultCellClasses.style,
                      BodyCellClasses.required,
                      BodyCellClasses.style,
                      column.alignClassName,
                      column.className,
                      resolvedCellClassName,
                    )}
                  >
                    {column.cell(row, rowIndex)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
