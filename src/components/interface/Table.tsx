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

const TABLE_CLASS = 'w-full table-fixed';

const DEFAULT_CELL_CLASS = 'align-middle ';

const HEADER_ROW_CLASS = 'h-(--size-2xl)';

const BODY_ROW_CLASS = '';

const HEADER_CELL_CLASS = 'px-(--size-s) text-center bg-neutral-50';

const STICKY_HEADER_CELL_CLASS = 'sticky top-0 z-20';

const BODY_CELL_CLASS = 'px-(--size-s)';

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
    <table className={twMerge(TABLE_CLASS, className)}>
      <colgroup>
        {columns.map((column) => (
          <col key={column.key} style={column.width ? { width: column.width } : undefined} />
        ))}
      </colgroup>
      {shouldShowHeader && (
        <thead>
          <tr className={twMerge(rowHeightClassName, HEADER_ROW_CLASS)}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={twMerge(
                  DEFAULT_CELL_CLASS,
                  HEADER_CELL_CLASS,
                  stickyHeader && STICKY_HEADER_CELL_CLASS,
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
          <tr key={rowIndex} className={twMerge(BODY_ROW_CLASS, rowHeightClassName)}>
            {columns.map((column) => {
              const resolvedCellClassName = typeof column.cellClassName === 'function'
                ? column.cellClassName(row, rowIndex)
                : column.cellClassName;

              return (
                <td
                  key={column.key}
                  className={twMerge(
                    DEFAULT_CELL_CLASS,
                    BODY_CELL_CLASS,
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
            <td colSpan={columns.length} className={twMerge(BODY_CELL_CLASS, 'p-0')}>
              {footer}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
