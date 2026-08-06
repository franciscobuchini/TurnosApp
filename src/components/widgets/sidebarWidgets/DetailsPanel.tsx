/*
  src/components/widgets/DetailsPanel.tsx
  Panel colapsable reutilizable con details/summary.
*/

import { useRef } from 'react';
import type { DetailsHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Dropdown from '../../interface/Dropdown';
import Image from '../../interface/Image';
import Table, { type TableColumn } from '../../interface/Table';
import ContentHeader from '../../interface/ContentHeader';
import { useFiltersGroup } from '../../../functions/filtersGroupContext';
import AddButton from '../../buttons/AddButton';
import SummaryButton from '../../buttons/SummaryButton';

export interface DetailsPanelOption {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

interface DetailsPanelProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  title: string;
  options: DetailsPanelOption[];
  renderDropdownItems?: (option: DetailsPanelOption) => ReactNode[];
  action?: ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
}

/* FilterPanelClasses: contenedor nativo del panel */
const FilterPanelClasses = {
  required: 'group w-full cursor-pointer p-(--size-xs) shrink-0',
  style: 'bg-neutral-900 rounded-3xl text-white',
  animations:
    '[interpolate-size:allow-keywords] [&::details-content]:overflow-hidden [&::details-content]:[block-size:0] [&::details-content]:opacity-0 [&::details-content]:-tranneutral-y-1 motion-safe:[&::details-content]:transition-[block-size,content-visibility,opacity,transform] motion-safe:[&::details-content]:duration-200 motion-safe:[&::details-content]:ease-out motion-safe:[&::details-content]:[transition-behavior:allow-discrete] open:[&::details-content]:[block-size:auto] open:[&::details-content]:opacity-100 open:[&::details-content]:tranneutral-y-0',
};

/* FilterPanelBodyClasses: wrapper de la lista de opciones + botón de acción, dentro del details abierto */
const FilterPanelBodyClasses = {
  required: 'flex flex-col gap-(--size-s) flex-1 min-h-0 overflow-y-auto',
  style: '',
  animations: 'motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out',
};

/* DetailsPanelContentClasses: wrapper del contenido del trigger (imagen + label). */
const DetailsPanelContentClasses = {
  required: 'flex items-center gap-(--size-s) w-full h-(--size-2xl) text-left',
  style: '',
  animations: '',
};

/* DetailsPanelAvatarClasses: forma y tamaño de la imagen del trigger. */
const DetailsPanelAvatarClasses = {
  required: 'h-(--size-xl) w-(--size-xl) shrink-0',
  style: '',
  animations: '',
};

/* DetailsPanelLabelClasses: texto del nombre en el trigger. */
const DetailsPanelLabelClasses = {
  required: '',
  style: 'transition-opacity',
  animations: 'motion-safe:duration-150 motion-safe:ease-out',
};

/* el trigger completo (Dropdown) de cada fila. */
const DetailsPanelTriggerClasses = {
  required: 'w-full justify-start px-(--size-xs)',
  style: 'bg-transparent hover:bg-black',
  animations:
    'motion-safe:transition-colors motion-safe:duration-150 motion-safe:ease-out hover:[&_[data-details-panel-content]]:tranneutral-x-0.5',
};
/* estilo que se aplica al trigger cuando el dropdown está abierto */
const DetailsPanelTriggerOpenClasses = {
  style: 'bg-black',
};

export default function DetailsPanel({
  title,
  options,
  renderDropdownItems,
  action,
  actionLabel,
  onActionClick,
  className,
  name,
  ...props
}: DetailsPanelProps) {
  /* Si no se pasa un name explícito, usa el del contenedor (sidebar/maincontent)
     para que abrir este panel cierre a los demás del mismo contenedor. */
  const groupName = useFiltersGroup();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const columns: TableColumn<DetailsPanelOption>[] = [
    {
      key: 'content',
      header: null,
      cellClassName: 'p-0',
      cell: (option) => (
        <Dropdown
          items={renderDropdownItems ? renderDropdownItems(option) : []}
          content={
            <div
              data-details-panel-content
              className={twMerge(
                DetailsPanelContentClasses.required,
                DetailsPanelContentClasses.style,
                DetailsPanelContentClasses.animations,
                option.checked === false && 'opacity-40',
              )}
            >
              <span
                data-details-panel-avatar
                className={twMerge(
                  DetailsPanelAvatarClasses.required,
                  DetailsPanelAvatarClasses.style,
                  DetailsPanelAvatarClasses.animations,
                )}
              >
                <Image
                  name={option.label}
                  className="h-full w-full"
                />
              </span>
              <span
                className={twMerge(
                  DetailsPanelLabelClasses.required,
                  DetailsPanelLabelClasses.style,
                  DetailsPanelLabelClasses.animations,
                )}
              >
                {option.label}
              </span>
            </div>
          }
          className={twMerge(
            DetailsPanelTriggerClasses.required,
            DetailsPanelTriggerClasses.style,
            DetailsPanelTriggerClasses.animations,
          )}
          openClassName={twMerge(DetailsPanelTriggerOpenClasses.style)}
        />
      ),
    },
  ];

  return (
    <details
      {...props}
      ref={detailsRef}
      data-filter-panel
      name={name ?? groupName}
      onToggle={(e) => {
        props.onToggle?.(e);

        const details = e.currentTarget;

        window.requestAnimationFrame(() => {
          details.dispatchEvent(new Event('resize-filter-panel'));
        });

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
      className={twMerge(FilterPanelClasses.required, FilterPanelClasses.style, FilterPanelClasses.animations, className)}
    >
      <summary>
        <ContentHeader
          title={title}
          action={<SummaryButton />}
        />
      </summary>

      <div
        data-filter-panel-body
        className={twMerge(
          FilterPanelBodyClasses.required,
          FilterPanelBodyClasses.style,
          FilterPanelBodyClasses.animations,
        )}
      >
        <Table
          columns={columns}
          rows={options}
          rowHeightClassName=""
          footer={
            action ??
            (actionLabel ? (
              <AddButton
                text={actionLabel}
                onClick={onActionClick}
              />
            ) : undefined)
          }
        />
      </div>
    </details>
  );
}
