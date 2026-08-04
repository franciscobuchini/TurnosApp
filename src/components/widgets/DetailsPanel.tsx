/*
  src/components/widgets/DetailsPanel.tsx
  Panel colapsable reutilizable con details/summary.
*/

import type { DetailsHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';
import Image from '../interface/Image';
import Table, { type TableColumn } from '../interface/Table';
import ContentHeader from './ContentHeader';
import { useFiltersGroup } from '../../functions/filtersGroupContext';

export interface DetailsPanelOption {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

interface DetailsPanelProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  title: string;
  options: DetailsPanelOption[];
  onToggleOption?: (id: string, checked: boolean) => void;
  actionLabel?: string;
  onActionClick?: () => void;
}

/* FilterPanelClasses: contenedor nativo del panel. shrink-0 en la base: cerrado, nunca se comprime.
   open:shrink: solo cuando está abierto participa de la compresión del flex-col del Sidebar,
   así se hace tan grande como el contenido le permita, y cuando el conjunto del Sidebar
   ya no tiene más espacio, se comprime y el overflow-y-auto de FilterPanelOptionsClasses
   activa el scroll interno. */
const FilterPanelClasses = {
  required: 'group flex w-full flex-col cursor-pointer p-(--size-xs) shrink-0 open:shrink open:gap-(--size-s) open:min-h-0 open:overflow-hidden',
  style: 'bg-stone-900 rounded-3xl text-white',
};

/* FilterPanelSummaryIconClasses: flecha del summary, rota cuando details está abierto */
const FilterPanelSummaryIconClasses = {
  required: 'transition-transform duration-200 group-open:rotate-180',
  style: '',
};

/* FilterPanelBodyClasses: wrapper de la lista de opciones + botón de acción, dentro del details abierto */
const FilterPanelBodyClasses = {
  required: 'flex flex-col flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-stone-850 [&::-webkit-scrollbar-thumb]:rounded-full',
  style: '',
};

/* FilterPanelActionButtonClasses: estilo para el botón de acción al final */
const FilterPanelActionButtonClasses = {
  required: 'w-full mt-(--size-s) shrink-0',
  style: 'bg-transparent',
};

/* FilterPanelTableCellLabelClasses: clase para la celda del texto/label */
const FilterPanelTableCellLabelClasses = 'h-10 p-0 pl-(--size-s) align-middle text-left text-sm';

/* FilterPanelTableSideCellClasses: clases para las columnas laterales pequeñas */
const FilterPanelTableSideCellClasses = 'h-(--size-xl) w-(--size-xl) p-0 align-middle text-center';

export default function DetailsPanel({
  title,
  options,
  onToggleOption,
  actionLabel,
  onActionClick,
  className,
  name,
  ...props
}: DetailsPanelProps) {
  /* Si no se pasa un name explícito, usa el del contenedor (sidebar/maincontent)
     para que abrir este panel cierre a los demás del mismo contenedor. */
  const groupName = useFiltersGroup();

  const columns: TableColumn<DetailsPanelOption>[] = [
    {
      key: 'left-action',
      header: null,
      width: 'var(--size-xl)',
      cellClassName: FilterPanelTableSideCellClasses,
      cell: (option) => (
        <Image name={option.label} className="h-(--size-xl) w-(--size-xl) rounded-full" />
      ),
    },
    {
      key: 'label',
      header: null,
      cellClassName: FilterPanelTableCellLabelClasses,
      cell: (option) => <span>{option.label}</span>,
    },
  ];

  return (
    <details
      {...props}
      data-filter-panel
      name={name ?? groupName}
      onToggle={(e) => {
        props.onToggle?.(e);

        const details = e.currentTarget;

        if (details.open || !groupName) return;

        const openedFilters = document.querySelector(
          `details[name="${groupName}"][data-filter-panel][open]`,
        );

        if (!openedFilters) {
          const calendar = document.querySelector<HTMLDetailsElement>(
            `details[name="${groupName}"][data-calendar]`,
          );

          if (calendar) {
            calendar.open = true;
          }
        }
      }}
      className={twMerge(FilterPanelClasses.required, FilterPanelClasses.style, className)}
    >
      <summary>
        <ContentHeader
          title={title}
          action={<ChevronDown className={twMerge(FilterPanelSummaryIconClasses.required, FilterPanelSummaryIconClasses.style)} size={20} />}
        />
      </summary>

      <div className={twMerge(FilterPanelBodyClasses.required, FilterPanelBodyClasses.style)}>
        <Table
          columns={columns}
          rows={options}
          rowHeightClassName=""
          className="w-full text-white"
        />

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
      </div>
    </details>
  );
}
