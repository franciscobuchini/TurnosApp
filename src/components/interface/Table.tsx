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
  sizeClassName?: string;
  colorClassName?: string;
  shapeClassName?: string;
  animationClassName?: string;
}

/* TableStyle: clases de estilo, estas si se pueden variar */
const TableStyle = {
  base: 'w-full table-fixed',
  size: '',
  color: '',
  shape: '',
  animation: '',
};

export default function Table<T>({
  columns,
  rows,
  rowHeightClassName,
  className = '',
  sizeClassName,
  colorClassName,
  shapeClassName,
  animationClassName,
}: TableProps<T>) {
  const defaultCellClassName = 'align-middle';
  const headerRowClassName = 'h-(--size-2xl)';
  const bodyRowClassName = '';
  const headerCellClassName = 'px-(--size-s)';
  const bodyCellClassName = 'px-(--size-s)';

  return (
    <Box>
      <table className={twMerge(TableStyle.base, sizeClassName || TableStyle.size, colorClassName || TableStyle.color, shapeClassName || TableStyle.shape, animationClassName || TableStyle.animation, className)}>
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={column.width ? { width: column.width } : undefined} />
          ))}
        </colgroup>
        {columns.some((column) => column.header) && (
          <thead>
            <tr className={twMerge(rowHeightClassName, headerRowClassName)}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={twMerge(
                    defaultCellClassName,
                    headerCellClassName,
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
            <tr key={rowIndex} className={twMerge(bodyRowClassName, rowHeightClassName)}>
              {columns.map((column) => {
                const resolvedCellClassName = typeof column.cellClassName === 'function'
                  ? column.cellClassName(row, rowIndex)
                  : column.cellClassName;

                return (
                  <td
                    key={column.key}
                    className={twMerge(
                      defaultCellClassName,
                      bodyCellClassName,
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