/* 
  src/components/interface/Select.tsx
  Componente de selección (Select) personalizado con el mismo estilo y comportamiento que Dropdown.
*/

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectMenuProps {
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  onClose: () => void;
}

/* SelectClasses (contenedor)*/
const SelectClasses = {
  required: 'relative inline-flex flex-col h-(--size-2xl) px-(--size-m)',
  style: '',
};

/* SelectTriggerClasses (Button interno)*/
const SelectTriggerClasses = {
  required: 'flex justify-between items-center w-full gap-4 h-(--size-2xl) px-(--size-m)',
  style: '',
};

/* SelectIconClasses (chevron)*/
const SelectIconClasses = {
  required: 'transition-transform duration-200 h-(--size-2xl) px-(--size-m)',
  style: 'text-black',
};

/* SelectMenuClasses (panel flotante)*/
const SelectMenuClasses = {
  required: 'absolute left-0 top-full z-110 w-full mt-(--size-xs) min-w-(--size-2xl)',
  style: 'bg-white shadow-lg border border-black/10',
};

/* SelectItemClasses (cada opción del menu)*/
const SelectItemClasses = {
  required: 'block w-full whitespace-nowrap text-left px-(--size-m) py-(--size-s)',
  style: '',
};

function SelectMenu({ options, onSelect, onClose }: SelectMenuProps) {
  return (
    <div
      role="listbox"
      className={twMerge(SelectMenuClasses.required, SelectMenuClasses.style)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="option"
          className={twMerge(SelectItemClasses.required, SelectItemClasses.style)}
          onClick={() => {
            onSelect(option);
            onClose();
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!selectRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={selectRef} className={twMerge(SelectClasses.required, SelectClasses.style, className)}>
      <Button
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={SelectTriggerClasses.required}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={twMerge(SelectIconClasses.required, SelectIconClasses.style, isOpen ? 'rotate-180' : '')}
        />
      </Button>

      {isOpen && (
        <SelectMenu
          options={options}
          onSelect={(option) => onChange(option.value)}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
