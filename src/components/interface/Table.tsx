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
  cellClassName?: string;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowHeightClassName: string;
  className?: string;
}

/* TableStyle: clases de estilo, estas si se pueden variar */
const TableStyle = {
  box: '',
  table: '',
  headerRow: 'h-(--size-2xl)',
  headerCell: 'px-(--size-s) border-b-1 border-black',
  bodyRow: '',
  bodyCell: 'px-(--size-s) border-t-1 border-b-1 border-black',
};

export default function Table<T>({
  columns,
  rows,
  rowHeightClassName,
  className = '',
}: TableProps<T>) {
  const defaultCellClassName = 'align-middle';

  return (
    <Box className={TableStyle.box}>
      <table className={twMerge('w-full table-fixed', TableStyle.table, className)}>
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={column.width ? { width: column.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr className={twMerge(rowHeightClassName, TableStyle.headerRow)}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={twMerge(
                  defaultCellClassName,
                  TableStyle.headerCell,
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
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={twMerge('last:[&>td]:border-b-0', rowHeightClassName, TableStyle.bodyRow)}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={twMerge(
                    defaultCellClassName,
                    TableStyle.bodyCell,
                    column.alignClassName,
                    column.className,
                    column.cellClassName,
                  )}
                >
                  {column.cell(row, rowIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}