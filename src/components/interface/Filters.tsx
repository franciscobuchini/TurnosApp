/*
  src/components/interface/Filters.tsx
  Filtro colapsable reutilizable con details/summary.
*/

import type { DetailsHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Checkbox from './Checkbox';
import ContentHeader from '../widgets/ContentHeader';
import { useFiltersGroup } from '../../functions/filtersGroupContext';

export interface FiltersOption {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

interface FiltersProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  title: string;
  options: FiltersOption[];
  onToggleOption?: (id: string, checked: boolean) => void;
}

/* FiltersClasses: contenedor nativo del filtro. El gap solo aplica cuando está abierto,
   para que no deje un espacio fantasma cuando está cerrado. */
const FiltersClasses = {
  required: 'group flex w-full flex-col cursor-pointer p-(--size-m) open:gap-(--size-s)',
  style: 'bg-stone-900 rounded-3xl text-white',
};

/* FiltersSummaryClasses: encabezado visible del details */
const FiltersSummaryClasses = {
  required: '',
  style: '',
};

/* FiltersSummaryIconClasses: flecha del summary, rota cuando details esta abierto */
const FiltersSummaryIconClasses = {
  required: 'transition-transform duration-200 group-open:rotate-180',
  style: '',
};

/* FiltersOptionsClasses: opciones desplegadas del filtro */
const FiltersOptionsClasses = {
  required: 'flex flex-col gap-(--size-s)',
  style: '',
};

export default function Filters({
  title,
  options,
  onToggleOption,
  className,
  name,
  ...props
}: FiltersProps) {
  /* Si no se pasa un name explícito, usa el del contenedor (sidebar/maincontent)
     para que abrir este filtro cierre a los demás del mismo contenedor. */
  const groupName = useFiltersGroup();

  return (
    <details
      {...props}
      name={name ?? groupName}
      className={twMerge(FiltersClasses.required, FiltersClasses.style, className)}
    >
      <summary className={twMerge(FiltersSummaryClasses.required, FiltersSummaryClasses.style)}>
        <ContentHeader
          title={title}
          action={<ChevronDown className={twMerge(FiltersSummaryIconClasses.required, FiltersSummaryIconClasses.style)} size={20} />}
        />
      </summary>

      <div className={twMerge(FiltersOptionsClasses.required, FiltersOptionsClasses.style)}>
        {options.map((option) => (
          <Checkbox
            key={option.id}
            id={option.id}
            label={option.label}
            checked={option.checked}
            disabled={option.disabled}
            onChange={onToggleOption}
          />
        ))}
      </div>
    </details>
  );
}