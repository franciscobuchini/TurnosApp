/* 
  src/components/interface/Filters.tsx
  Componente de filtro colapsable tipo details/summary: un título que al
  clickear despliega una lista de opciones con checkbox. El contenido
  (título y opciones) se recibe siempre por props, para poder reutilizarlo
  con distinto contenido en distintos lugares.
*/

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Icon from './Icon';

export interface FiltersOption {
  id: string;
  label: string;
  checked: boolean;
}

interface FiltersProps {
  title: string;
  options: FiltersOption[];
  onToggleOption: (id: string) => void;
  defaultOpen?: boolean;
  className?: string;
  styleClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  iconClassName?: string;
  optionsClassName?: string;
  optionClassName?: string;
  checkboxClassName?: string;
  labelClassName?: string;
}

/* FiltersClasses: contenedor general del filtro */
const FiltersClasses = {
  required: 'flex flex-col w-full',
  style: '',
};

/* FiltersHeaderClasses: botón que dispara el abierto/cerrado (equivalente al <summary>) */
const FiltersHeaderClasses = {
  required: 'flex w-full items-center justify-between',
  style: '',
};

/* FiltersTitleClasses: texto del título del filtro (ej: "Trabajadores") */
const FiltersTitleClasses = {
  required: '',
  style: '',
};

/* FiltersIconClasses: flecha que indica el estado, rota cuando está abierto */
const FiltersIconClasses = {
  required: 'transition-transform duration-200',
  style: '',
  open: 'rotate-180',
};

/* FiltersOptionsClasses: contenedor de las opciones (equivalente al <details> abierto) */
const FiltersOptionsClasses = {
  required: 'flex flex-col',
  style: '',
};

/* FiltersOptionClasses: cada fila individual con checkbox + label */
const FiltersOptionClasses = {
  required: 'flex items-center cursor-pointer',
  style: '',
};

/* FiltersCheckboxClasses: el input checkbox en sí */
const FiltersCheckboxClasses = {
  required: '',
  style: '',
};

/* FiltersLabelClasses: el texto de cada opción */
const FiltersLabelClasses = {
  required: '',
  style: '',
};

export default function Filters({
  title,
  options,
  onToggleOption,
  defaultOpen = false,
  className,
  styleClassName,
  headerClassName,
  titleClassName,
  iconClassName,
  optionsClassName,
  optionClassName,
  checkboxClassName,
  labelClassName,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <div className={twMerge(FiltersClasses.required, styleClassName || FiltersClasses.style, className)}>
      <button type="button" onClick={toggleOpen} className={twMerge(FiltersHeaderClasses.required, FiltersHeaderClasses.style, headerClassName)}>
        <span className={twMerge(FiltersTitleClasses.required, FiltersTitleClasses.style, titleClassName)}>
          {title}
        </span>
        <Icon
          name="ChevronDown"
          className={twMerge(FiltersIconClasses.required, FiltersIconClasses.style, isOpen && FiltersIconClasses.open, iconClassName)}
        />
      </button>

      {isOpen ? (
        <div className={twMerge(FiltersOptionsClasses.required, FiltersOptionsClasses.style, optionsClassName)}>
          {options.map((option) => (
            <label
              key={option.id}
              className={twMerge(FiltersOptionClasses.required, FiltersOptionClasses.style, optionClassName)}
            >
              <input
                type="checkbox"
                checked={option.checked}
                onChange={() => onToggleOption(option.id)}
                className={twMerge(FiltersCheckboxClasses.required, FiltersCheckboxClasses.style, checkboxClassName)}
              />
              <span className={twMerge(FiltersLabelClasses.required, FiltersLabelClasses.style, labelClassName)}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}