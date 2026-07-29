/* 
  src/components/interface/Select.tsx
  Componente de selección (Select) personalizado con el mismo estilo y comportamiento que Dropdown.
*/

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Icon from './Icon';
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

const SelectMenuStyle = {
  menu: 'mt-(--size-xs) min-w-(--size-2xl) w-full bg-white shadow-lg border border-black/10',
  item: 'px-(--size-m) py-(--size-s) text-left',
};

function SelectMenu({ options, onSelect, onClose }: SelectMenuProps) {
  return (
    <div
      role="listbox"
      className={twMerge('absolute left-0 top-full z-110 w-full', SelectMenuStyle.menu)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="option"
          className={twMerge('block w-full whitespace-nowrap text-left', SelectMenuStyle.item)}
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
  sizeClassName?: string;
  className?: string;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  sizeClassName = 'h-(--size-2xl) px-(--size-m)',
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
    <div ref={selectRef} className={twMerge('relative inline-flex flex-col', className)}>
      <Button
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={twMerge('flex justify-between items-center w-full gap-4', sizeClassName)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <Icon
          name="ChevronDown"
          className={twMerge('transition-transform duration-200', isOpen ? 'rotate-180' : '')}
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
