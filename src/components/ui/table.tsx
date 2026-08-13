"use client"

import * as React from "react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/*
  src/components/ui/table.tsx
  `Table` es genérico (declarás columnas, no filas de JSX a mano) y arma el
  markup con las piezas de shadcn (TableHeader/TableRow/TableHead/TableCell)
  para que el estilo salga del mismo sistema que el resto de los primitivos.
*/
export interface TableColumn<T> {
  key: string
  header: ReactNode
  cell: (row: T, rowIndex: number) => ReactNode
  className?: string
  alignClassName?: string
  headerClassName?: string
  cellClassName?: string | ((row: T, rowIndex: number) => string)
  width?: string
}

interface GenericTableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  rowHeightClassName?: string
  /** Alto de fila en píxeles, como inline style: pisa rowHeightClassName
      (útil cuando el alto es un valor dinámico, ej. un zoom). */
  rowHeightPx?: number
  className?: string
  headerClassName?: string
  footer?: ReactNode
  showHeader?: boolean
  stickyHeader?: boolean
}

function Table<T>({
  columns,
  rows,
  rowHeightClassName = "",
  rowHeightPx,
  className = "",
  headerClassName = "",
  footer,
  showHeader,
  stickyHeader = false,
}: GenericTableProps<T>) {
  const rowHeightStyle = rowHeightPx !== undefined ? { height: `${rowHeightPx}px` } : undefined
  const shouldShowHeader = showHeader ?? columns.some((column) => column.header)

  return (
    <table className={cn("w-full table-fixed", className)}>
      <colgroup>
        {columns.map((column) => (
          <col key={column.key} style={column.width ? { width: column.width } : undefined} />
        ))}
      </colgroup>
      {shouldShowHeader && (
        <TableHeader>
          <TableRow className={rowHeightClassName} style={rowHeightStyle}>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "text-center bg-card",
                  stickyHeader && "sticky top-0 z-30",
                  column.alignClassName,
                  column.className,
                  headerClassName,
                  column.headerClassName,
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={rowIndex} className={rowHeightClassName} style={rowHeightStyle}>
            {columns.map((column) => {
              const resolvedCellClassName =
                typeof column.cellClassName === "function"
                  ? column.cellClassName(row, rowIndex)
                  : column.cellClassName

              return (
                <TableCell
                  key={column.key}
                  className={cn(
                    "align-middle whitespace-normal",
                    column.alignClassName,
                    column.className,
                    resolvedCellClassName,
                  )}
                >
                  {column.cell(row, rowIndex)}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>

      {footer && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length} className="p-0">
              {footer}
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </table>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
