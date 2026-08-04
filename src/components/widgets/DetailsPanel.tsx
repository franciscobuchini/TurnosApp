/*
  src/components/widgets/DetailsPanel.tsx
  Panel colapsable reutilizable con details/summary.
*/

import { useEffect, useRef, useState } from 'react';
import type { DetailsHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Dropdown from '../interface/Dropdown';
import Image from '../interface/Image';
import Table, { type TableColumn } from '../interface/Table';
import ContentHeader from './ContentHeader';
import { useFiltersGroup } from '../../functions/filtersGroupContext';
import AddButton from '../buttons/AddButton';
import SummaryButton from '../buttons/SummaryButton';

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
  actionLabel?: string;
}

/* FilterPanelClasses: contenedor nativo del panel */
const FilterPanelClasses = {
  required: 'group w-full cursor-pointer p-(--size-xs) shrink-0',
  style: 'bg-stone-900 rounded-3xl text-white',
};

/* FilterPanelBodyClasses: wrapper de la lista de opciones + botón de acción, dentro del details abierto */
const FilterPanelBodyClasses = {
  required: 'flex flex-col gap-(--size-s) flex-1 min-h-0 overflow-y-auto',
  style: '',
  scrollbar: '[scrollbar-width:thin] [scrollbar-color:var(--color-stone-600)_transparent] [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-stone-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-corner]:bg-transparent'
};

/* DetailsPanelContentClasses: wrapper del contenido del trigger (imagen + label). */
const DetailsPanelContentClasses = {
  required: 'flex items-center gap-(--size-s) w-full h-(--size-2xl) text-left',
  style: '',
};

/* DetailsPanelAvatarClasses: forma y tamaño de la imagen del trigger. */
const DetailsPanelAvatarClasses = {
  required: 'h-(--size-xl) w-(--size-xl) rounded-full shrink-0',
  style: '',
};

/* DetailsPanelLabelClasses: texto del nombre en el trigger. */
const DetailsPanelLabelClasses = {
  required: '',
  style: '',
};

/* el trigger completo (Dropdown) de cada fila. */
const DetailsPanelTriggerClasses = {
  required: 'w-full justify-start px-(--size-xs)',
  style: 'bg-transparent hover:bg-stone-950',
};
/* estilo que se aplica al trigger cuando el dropdown está abierto */
const DetailsPanelTriggerOpenClasses = {
  style: 'bg-stone-950',
};

export default function DetailsPanel({
  title,
  options,
  renderDropdownItems,
  actionLabel,
  className,
  name,
  ...props
}: DetailsPanelProps) {
  /* Si no se pasa un name explícito, usa el del contenedor (sidebar/maincontent)
     para que abrir este panel cierre a los demás del mismo contenedor. */
  const groupName = useFiltersGroup();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [bodyMaxHeight, setBodyMaxHeight] = useState<number | undefined>();

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    const updateBodyMaxHeight = () => {
      if (!details.open) {
        setBodyMaxHeight(undefined);
        return;
      }

      const parent = details.parentElement;
      const summary = details.querySelector('summary');
      const body = details.querySelector<HTMLElement>('[data-filter-panel-body]');

      if (!parent || !summary || !body) return;

      const parentStyles = getComputedStyle(parent);
      const detailsStyles = getComputedStyle(details);
      const parentRect = parent.getBoundingClientRect();
      const detailsRect = details.getBoundingClientRect();
      const summaryRect = summary.getBoundingClientRect();

      const parentPaddingBottom = Number.parseFloat(parentStyles.paddingBottom) || 0;
      const detailsPaddingTop = Number.parseFloat(detailsStyles.paddingTop) || 0;
      const detailsPaddingBottom = Number.parseFloat(detailsStyles.paddingBottom) || 0;
      const detailsGap = Number.parseFloat(detailsStyles.rowGap) || Number.parseFloat(detailsStyles.gap) || 0;

      const availablePanelHeight = parentRect.bottom
        - parentPaddingBottom
        - detailsRect.top
        - detailsPaddingTop
        - detailsPaddingBottom;

      const nextBodyMaxHeight = Math.max(0, availablePanelHeight - summaryRect.height - detailsGap);

      setBodyMaxHeight(nextBodyMaxHeight);
    };

    updateBodyMaxHeight();

    const resizeObserver = new ResizeObserver(updateBodyMaxHeight);
    resizeObserver.observe(details);
    resizeObserver.observe(document.body);

    details.addEventListener('resize-filter-panel', updateBodyMaxHeight);
    window.addEventListener('resize', updateBodyMaxHeight);

    return () => {
      resizeObserver.disconnect();
      details.removeEventListener('resize-filter-panel', updateBodyMaxHeight);
      window.removeEventListener('resize', updateBodyMaxHeight);
    };
  }, []);

  const columns: TableColumn<DetailsPanelOption>[] = [
    {
      key: 'content',
      header: null,
      cellClassName: 'p-0',
      cell: (option) => (
        <Dropdown
          items={renderDropdownItems ? renderDropdownItems(option) : []}
          content={
            <div className={twMerge(DetailsPanelContentClasses.required, DetailsPanelContentClasses.style)}>
              <Image
                name={option.label}
                className={twMerge(DetailsPanelAvatarClasses.required, DetailsPanelAvatarClasses.style)}
              />
              <span className={twMerge(DetailsPanelLabelClasses.required, DetailsPanelLabelClasses.style)}>
                {option.label}
              </span>
            </div>
          }
          className={twMerge(DetailsPanelTriggerClasses.required, DetailsPanelTriggerClasses.style)}
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
      className={twMerge(FilterPanelClasses.required, FilterPanelClasses.style, className)}
    >
      <summary>
        <ContentHeader
          title={title}
          action={<SummaryButton />}
        />
      </summary>

      <div
        data-filter-panel-body
        className={twMerge(FilterPanelBodyClasses.required, FilterPanelBodyClasses.style, FilterPanelBodyClasses.scrollbar)}
        style={bodyMaxHeight === undefined ? undefined : { maxHeight: bodyMaxHeight }}
      >
        <Table
          columns={columns}
          rows={options}
          rowHeightClassName=""
          footer={
            actionLabel ? (
              <AddButton text={actionLabel} />
            ) : undefined
          }
        />
      </div>
    </details>
  );
}
