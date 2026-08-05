/* 
  src/components/interface/Table.tsx
  Componente de tabla genérico que se puede utilizar para mostrar datos en forma de tabla.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

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
  headerClassName?: string;
  footer?: ReactNode;
  showHeader?: boolean;
  stickyHeader?: boolean;
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
  required: 'px-(--size-s) text-center',
  style: 'bg-white',
};

const StickyHeaderCellClasses = {
  required: 'sticky top-0 z-20',
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
  headerClassName = '',
  footer,
  showHeader,
  stickyHeader = false,
}: TableProps<T>) {
  const shouldShowHeader = showHeader ?? columns.some((column) => column.header);

  return (
    <table className={twMerge(TableClasses.required, TableClasses.style, className)}>
      <colgroup>
        {columns.map((column) => (
          <col key={column.key} style={column.width ? { width: column.width } : undefined} />
        ))}
      </colgroup>
      {shouldShowHeader && (
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
                  stickyHeader && StickyHeaderCellClasses.required,
                  stickyHeader && StickyHeaderCellClasses.style,
                  column.alignClassName,
                  column.className,
                  headerClassName,
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

      {footer && (
        <tfoot>
          <tr>
            <td colSpan={columns.length} className={twMerge(BodyCellClasses.required, BodyCellClasses.style, 'p-0')}>
              {footer}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
