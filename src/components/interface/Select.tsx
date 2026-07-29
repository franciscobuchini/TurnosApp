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

const SelectStyle = {
  base: 'relative inline-flex flex-col',
  size: '',
  color: '',
  shape: '',
  animation: '',
};

const SelectTriggerStyle = {
  base: 'flex justify-between items-center w-full gap-4',
  size: '',
  color: '',
  shape: '',
  animation: '',
};

const SelectIconStyle = {
  base: 'transition-transform duration-200',
  size: '',
  color: '',
  shape: '',
  animation: '',
};

const SelectMenuStyle = {
  base: 'absolute left-0 top-full z-110 w-full',
  size: 'mt-(--size-xs) min-w-(--size-2xl)',
  color: 'bg-white',
  shape: 'shadow-lg border border-black/10',
  animation: '',
};

const SelectItemStyle = {
  base: 'block w-full whitespace-nowrap text-left',
  size: 'px-(--size-m) py-(--size-s)',
  color: '',
  shape: '',
  animation: '',
};

function SelectMenu({ options, onSelect, onClose }: SelectMenuProps) {
  return (
    <div
      role="listbox"
      className={twMerge(SelectMenuStyle.base, SelectMenuStyle.size, SelectMenuStyle.color, SelectMenuStyle.shape, SelectMenuStyle.animation)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="option"
          className={twMerge(SelectItemStyle.base, SelectItemStyle.size, SelectItemStyle.color, SelectItemStyle.shape, SelectItemStyle.animation)}
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
  colorClassName?: string;
  shapeClassName?: string;
  animationClassName?: string;
  className?: string;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  sizeClassName = 'h-(--size-2xl) px-(--size-m)',
  colorClassName,
  shapeClassName,
  animationClassName,
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
    <div ref={selectRef} className={twMerge(SelectStyle.base, sizeClassName || SelectStyle.size, colorClassName || SelectStyle.color, shapeClassName || SelectStyle.shape, animationClassName || SelectStyle.animation, className)}>
      <Button
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={twMerge(SelectTriggerStyle.base, sizeClassName || SelectTriggerStyle.size, colorClassName || SelectTriggerStyle.color, shapeClassName || SelectTriggerStyle.shape, animationClassName || SelectTriggerStyle.animation)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <Icon
          name="ChevronDown"
          className={twMerge(SelectIconStyle.base, sizeClassName || SelectIconStyle.size, colorClassName || SelectIconStyle.color, shapeClassName || SelectIconStyle.shape, animationClassName || SelectIconStyle.animation, isOpen ? 'rotate-180' : '')}
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
