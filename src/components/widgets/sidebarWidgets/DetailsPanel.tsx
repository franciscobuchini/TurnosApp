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

const FILTER_PANEL_CLASS = 'group w-full cursor-pointer p-(--size-xs) shrink-0 bg-neutral-900 rounded-3xl text-white [interpolate-size:allow-keywords] [&::details-content]:overflow-hidden [&::details-content]:[block-size:0] [&::details-content]:opacity-0 [&::details-content]:-tranneutral-y-1 motion-safe:[&::details-content]:transition-[block-size,content-visibility,opacity,transform] motion-safe:[&::details-content]:duration-200 motion-safe:[&::details-content]:ease-out motion-safe:[&::details-content]:[transition-behavior:allow-discrete] open:[&::details-content]:[block-size:auto] open:[&::details-content]:opacity-100 open:[&::details-content]:tranneutral-y-0';

const FILTER_PANEL_BODY_CLASS = 'flex flex-col gap-(--size-s) flex-1 min-h-0 overflow-y-auto motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out';

const DETAILS_PANEL_CONTENT_CLASS = 'flex items-center gap-(--size-s) w-full h-(--size-2xl) text-left';

const DETAILS_PANEL_AVATAR_CLASS = 'h-(--size-xl) w-(--size-xl) shrink-0';
const DETAILS_PANEL_IMAGE_CLASS = 'h-full w-full';

const DETAILS_PANEL_LABEL_CLASS = 'transition-opacity motion-safe:duration-150 motion-safe:ease-out';

const DETAILS_PANEL_TRIGGER_CLASS = 'w-full justify-start px-(--size-xs) bg-transparent hover:bg-black motion-safe:transition-colors motion-safe:duration-150 motion-safe:ease-out hover:[&_[data-details-panel-content]]:tranneutral-x-0.5';
const DETAILS_PANEL_TRIGGER_OPEN_CLASS = 'bg-black';

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
              className={twMerge(DETAILS_PANEL_CONTENT_CLASS,
                option.checked === false && 'opacity-40',
              )}
            >
              <span
                data-details-panel-avatar
                className={twMerge(DETAILS_PANEL_AVATAR_CLASS,
                )}
              >
                <Image
                  name={option.label}
                  className={DETAILS_PANEL_IMAGE_CLASS}
                />
              </span>
              <span
                className={twMerge(DETAILS_PANEL_LABEL_CLASS,
                )}
              >
                {option.label}
              </span>
            </div>
          }
          className={twMerge(DETAILS_PANEL_TRIGGER_CLASS,
          )}
          openClassName={DETAILS_PANEL_TRIGGER_OPEN_CLASS}
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
      className={twMerge(FILTER_PANEL_CLASS, className)}
    >
      <summary>
        <ContentHeader
          title={title}
          action={<SummaryButton />}
        />
      </summary>

      <div
        data-filter-panel-body
        className={twMerge(FILTER_PANEL_BODY_CLASS,
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
