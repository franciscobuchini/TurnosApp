/* 
  src/components/interface/Dropdown.tsx
  Componente de dropdown (desplegable) para mostrar un menú de opciones.
*/

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

/* DropdownMenuProps: props que recibe DropdownMenu */
interface DropdownMenuProps {
  items: ReactNode[];
  position: { top: number; left: number };
}

/* DropdownClasses: contenedor raíz, solo posiciona */
const DropdownClasses = {
  required: 'relative',
};

/* DropdownMenuClasses */
const DropdownMenuClasses = {
  required: 'fixed z-[9999] p-(--size-s) overflow-hidden',
  style: 'bg-stone-950 shadow-2xl rounded-2xl',
};

/* DropdownMenu: es el panel del dropdown */
function DropdownMenu({ items, position }: DropdownMenuProps) {
  return createPortal(
    <div
      role="menu"
      className={twMerge(DropdownMenuClasses.required, DropdownMenuClasses.style)}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {items.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>,
    document.body,
  );
}

// ============================================================
// Dropdown: componente principal exportado
// ============================================================

/* DropdownProps: props que recibe Dropdown */
interface DropdownProps {
  items: ReactNode[];
  content: ReactNode;
  icon?: ReactNode;
  className?: string;
  openClassName?: string;
  disabled?: boolean;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
}

/* Dropdown: arma el boton trigger, controla el estado abierto/cerrado y renderiza DropdownMenu */
export default function Dropdown({
  items,
  content,
  icon,
  className,
  openClassName,
  disabled,
  onClick,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
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

  useEffect(() => {
    if (!isOpen) return;

    const trigger = dropdownRef.current?.querySelector('button');
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.right - 220,
    });
  }, [isOpen]);

  const handleToggle = (event: ReactMouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (disabled) return;

    onClick?.(event);
    setIsOpen((currentValue) => !currentValue);
  };

  return (
    <div ref={dropdownRef} className={DropdownClasses.required}>
      <Button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleToggle}
        icon={icon}
        className={twMerge(className, isOpen && openClassName)}
        disabled={disabled}
      >
        {content}
      </Button>

      {isOpen && <DropdownMenu items={items} position={menuPosition} />}
    </div>
  );
}