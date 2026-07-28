/* Dropdown.tsx: componente principal, arma el trigger y controla la apertura del menu */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

/* DropdownItem: forma de cada opcion del menu, se comparte entre Dropdown y DropdownMenu */
interface DropdownItem {
  label: string;
  onClick?: () => void;
}

// ============================================================
// DropdownMenu: panel flotante con la lista de opciones
// ============================================================

/* DropdownMenuProps: props que recibe DropdownMenu */
interface DropdownMenuProps {
  items: DropdownItem[];
  onClose: () => void;
}

/* DropdownMenuStyle: clases de estilo, estas si se pueden variar */
const DropdownMenuStyle = {
  menu: 'mt-(--size-xs) min-w-32 w-max bg-white shadow-lg border border-black/10',
  item: 'px-(--size-m) py-(--size-s) hover:bg-black/5',
};

/* DropdownMenu: es el panel del dropdown */
function DropdownMenu({ items, onClose }: DropdownMenuProps) {
  return (
    <div
      role="menu"
      className={twMerge('absolute right-0 top-full z-110', DropdownMenuStyle.menu)}
    >
      {items.map((item) => (
        <button
          key={item.label}
          role="menuitem"
          className={twMerge('block text-left whitespace-nowrap w-full', DropdownMenuStyle.item)}
          onClick={() => {
            item.onClick?.();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Dropdown: componente principal exportado
// ============================================================

/* DropdownProps: props que recibe Dropdown */
interface DropdownProps {
  items: DropdownItem[];
  content: ReactNode;
  sizeClassName: string;
}

/* Dropdown: arma el boton trigger, controla el estado abierto/cerrado y renderiza DropdownMenu */
export default function Dropdown({ items, content, sizeClassName }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* handleClickOutside: cierra el dropdown si se hace click fuera del area */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-flex justify-center">
      <Button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className={sizeClassName}
      >
        {content}
      </Button>

      {isOpen && (
        <DropdownMenu items={items} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}