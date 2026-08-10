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
*/

interface DropdownProps {
  items: ReactNode[]
  content: ReactNode
  icon?: ReactNode
  className?: string
  openClassName?: string
  disabled?: boolean
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void
}

export function Dropdown({ items, content, icon, className, openClassName, disabled, onClick }: DropdownProps) {
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
        align="start"
        onClick={() => setIsOpen(false)}
        className="w-fit min-w-30 overflow-hidden rounded-2xl bg-popover p-3 shadow-2xl"
      >
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
