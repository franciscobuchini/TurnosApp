/*
  src/components/widgets/FilterPanel.tsx
  Panel colapsable reutilizable con details/summary.
*/

import type { DetailsHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Checkbox from '../interface/Checkbox';
import Button from '../interface/Button';
import ContentHeader from './ContentHeader';
import { useFiltersGroup } from '../../functions/filtersGroupContext';

export interface FilterPanelOption {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

interface FilterPanelProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  title: string;
  options: FilterPanelOption[];
  onToggleOption?: (id: string, checked: boolean) => void;
  actionLabel?: string;
  onActionClick?: () => void;
}

/* FilterPanelClasses: contenedor nativo del panel. El gap solo aplica cuando está abierto,
   para que no deje un espacio fantasma cuando está cerrado. */
const FilterPanelClasses = {
  required: 'group flex w-full flex-col cursor-pointer p-(--size-m) open:gap-(--size-s)',
  style: 'bg-stone-900 rounded-3xl text-white',
};

/* FilterPanelSummaryClasses: encabezado visible del details */
const FilterPanelSummaryClasses = {
  required: '',
  style: '',
};

/* FilterPanelSummaryIconClasses: flecha del summary, rota cuando details está abierto */
const FilterPanelSummaryIconClasses = {
  required: 'transition-transform duration-200 group-open:rotate-180',
  style: '',
};

/* FilterPanelOptionsClasses: opciones desplegadas del panel */
const FilterPanelOptionsClasses = {
  required: 'flex flex-col gap-(--size-s)',
  style: '',
};

/* FilterPanelActionButtonClasses: estilo para el botón de acción al final */
const FilterPanelActionButtonClasses = {
  required: 'w-full mt-(--size-s) ',
  style: 'bg-transparent',
};

export default function FilterPanel({
  title,
  options,
  onToggleOption,
  actionLabel,
  onActionClick,
  className,
  name,
  ...props
}: FilterPanelProps) {
  /* Si no se pasa un name explícito, usa el del contenedor (sidebar/maincontent)
     para que abrir este panel cierre a los demás del mismo contenedor. */
  const groupName = useFiltersGroup();

  return (
    <details
      {...props}
      name={name ?? groupName}
      className={twMerge(FilterPanelClasses.required, FilterPanelClasses.style, className)}
    >
      <summary className={twMerge(FilterPanelSummaryClasses.required, FilterPanelSummaryClasses.style)}>
        <ContentHeader
          title={title}
          action={<ChevronDown className={twMerge(FilterPanelSummaryIconClasses.required, FilterPanelSummaryIconClasses.style)} size={20} />}
        />
      </summary>

      <div className={twMerge(FilterPanelOptionsClasses.required, FilterPanelOptionsClasses.style)}>
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

      {actionLabel && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onActionClick?.();
          }}
          text={actionLabel}
          className={twMerge(FilterPanelActionButtonClasses.required, FilterPanelActionButtonClasses.style)}
        />
      )}
    </details>
  );
}
