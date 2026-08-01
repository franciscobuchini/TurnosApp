/* Dropdown.tsx: componente principal, arma el trigger y controla la apertura del menu */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from './Button';
import type { TooltipPosition } from './Tooltip';

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

/* DropdownClasses*/
const DropdownClasses = {
  required: 'relative inline-flex justify-center',
  style: '',
};

/* DropdownMenuClasses*/
const DropdownMenuClasses = {
  required: 'absolute right-0 top-full z-110 mt-(--size-xs) min-w-(--size-2xl) w-max',
  style: 'bg-white shadow-lg border border-black/10',
};

/* DropdownItemClasses*/
const DropdownItemClasses = {
  required: 'block text-left whitespace-nowrap px-(--size-m) py-(--size-s)',
  style: 'hover:bg-black/5',
};

/* DropdownMenu: es el panel del dropdown */
function DropdownMenu({ items, onClose }: DropdownMenuProps) {
  return (
    <div
      role="menu"
      className={twMerge(DropdownMenuClasses.required, DropdownMenuClasses.style)}
    >
      {items.map((item) => (
        <Button
          key={item.label}
          role="menuitem"
          className={twMerge(DropdownItemClasses.required, DropdownItemClasses.style)}
          onClick={() => {
            item.onClick?.();
            onClose();
          }}
        >
          {item.label}
        </Button>
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
  iconOnly?: TooltipPosition;
  className?: string;
}

/* Dropdown: arma el boton trigger, controla el estado abierto/cerrado y renderiza DropdownMenu */
export default function Dropdown({ items, content, iconOnly, className }: DropdownProps) {
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
    <div ref={dropdownRef} className={twMerge(DropdownClasses.required, className || DropdownClasses.style)}>
      <Button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        iconOnly={iconOnly}
        className={className}
      >
        {content}
      </Button>

      {isOpen && (
        <DropdownMenu items={items} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
