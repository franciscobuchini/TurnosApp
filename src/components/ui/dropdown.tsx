import { useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/*
  src/components/ui/dropdown.tsx
  Trigger + panel flotante con contenido arbitrario (no una lista de acciones
  de texto), por eso se arma sobre Popover y no sobre DropdownMenu: el
  contenido de `items` son widgets interactivos propios (ver
  TeamFilterButton/ServiceFilterButton/ClientFilterButton), no ítems de menú.
  Reemplaza el cálculo manual de posición + portal por el posicionamiento de
  Radix (se reajusta solo si no entra en pantalla, cierra con Escape y click
  afuera).

  DROPDOWN_PANEL_CLASS/DROPDOWN_ITEM_CLASS quedan acá, exportadas, como el
  estilo canónico de "panel flotante" y "fila de acción" de toda la app —
  cualquier otro dropdown/menú (AppMenubar, EditAppointmentSidebar) los
  importa de acá en vez de declarar su propia variante, para que todos se
  vean iguales.
*/

export const DROPDOWN_PANEL_CLASS = 'w-fit min-w-30 overflow-hidden rounded-2xl bg-popover p-3 shadow-2xl';

export const DROPDOWN_ITEM_CLASS = 'justify-between w-full h-8 p-3 gap-6 bg-transparent text-muted-foreground hover:text-foreground';

interface DropdownProps {
  items: ReactNode[]
  content: ReactNode
  icon?: ReactNode
  className?: string
  openClassName?: string
  /** Se agrega (no reemplaza) a DROPDOWN_PANEL_CLASS — para casos puntuales
      que necesitan más ancho/alto máximo con scroll (ver SelectRow en
      EditAppointmentSidebar) sin perder el look común del panel. */
  contentClassName?: string
  /** Lado del trigger contra el que se alinea el panel (ver Radix Popover).
      "start" por default: los triggers de esta app suelen quedar a la
      izquierda de su contenedor, así que el panel abre hacia la derecha. */
  align?: 'start' | 'center' | 'end'
  disabled?: boolean
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void
}

export function Dropdown({ items, content, icon, className, openClassName, contentClassName, align = 'start', disabled, onClick }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={(open) => !disabled && setIsOpen(open)}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          icon={icon}
          disabled={disabled}
          onClick={onClick}
          className={cn(className, isOpen && openClassName)}
        >
          {content}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        onClick={() => setIsOpen(false)}
        className={cn(DROPDOWN_PANEL_CLASS, contentClassName)}
      >
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
