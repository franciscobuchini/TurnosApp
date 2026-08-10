/*
  src/components/widgets/DetailsPanel.tsx
  Panel colapsable reutilizable con details/summary.
*/

import type { DetailsHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Dropdown } from '@/components/ui/dropdown';
import Image from '@/components/ui/image';
import ContentHeader from '@/components/ui/content-header';
import { useFiltersGroup } from '@/hooks/useFiltersGroup';
import AddButton from '../../buttons/AddButton';
import SummaryButton from '../../buttons/SummaryButton';

export interface DetailsPanelOption {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  colorClassName?: string;
}

interface DetailsPanelProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  title: string;
  options: DetailsPanelOption[];
  renderDropdownItems?: (option: DetailsPanelOption) => ReactNode[];
  action?: ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
  hideHeader?: boolean;
}

const FILTER_PANEL_CLASS = 'group w-full cursor-pointer overflow-hidden p-2 shrink-0 bg-card rounded-3xl text-white';

const FILTER_PANEL_BODY_CLASS = 'flex flex-col flex-1 min-h-0 overflow-y-auto pt-1 ';

const DETAILS_PANEL_CONTENT_CLASS = 'flex items-center align-center  gap-3 h-12 w-full text-left';

const DETAILS_PANEL_AVATAR_CLASS = 'h-8 w-8 shrink-0';
const DETAILS_PANEL_IMAGE_CLASS = 'h-full w-full';

const DETAILS_PANEL_LABEL_CLASS = '';

const DETAILS_PANEL_TRIGGER_CLASS = 'w-full h-12 gap-4 shrink-0 justify-center text-neutral-400 hover:text-white';
const DETAILS_PANEL_TRIGGER_OPEN_CLASS = 'bg-neutral-950';

export default function DetailsPanel({
  title,
  options,
  renderDropdownItems,
  action,
  actionLabel,
  onActionClick,
  className,
  name,
  hideHeader = false,
  ...props
}: DetailsPanelProps) {
  /* Si no se pasa un name explícito, usa el del contenedor (sidebar/maincontent)
     para que abrir este panel cierre a los demás del mismo contenedor. */
  const groupName = useFiltersGroup();

  return (
    <details
      {...props}
      data-filter-panel
      data-panel-title={title}
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
      <summary hidden={hideHeader}>
        <ContentHeader title={title} action={<SummaryButton />} />
      </summary>

      <div data-filter-panel-body className={FILTER_PANEL_BODY_CLASS}>
        {options.map((option) => (
          <Dropdown
            key={option.id}
            items={renderDropdownItems ? renderDropdownItems(option) : []}
            content={
              <div
                data-details-panel-content
                className={twMerge(DETAILS_PANEL_CONTENT_CLASS, option.checked === false && 'opacity-40')}
              >
                <span className={DETAILS_PANEL_AVATAR_CLASS}>
                  <Image
                    name={option.label}
                    className={twMerge(DETAILS_PANEL_IMAGE_CLASS, option.colorClassName)}
                  />
                </span>
                <span className={DETAILS_PANEL_LABEL_CLASS}>{option.label}</span>
              </div>
            }
            className={DETAILS_PANEL_TRIGGER_CLASS}
            openClassName={DETAILS_PANEL_TRIGGER_OPEN_CLASS}
          />
        ))}

        {action ?? (actionLabel ? <AddButton text={actionLabel} onClick={onActionClick} /> : null)}
      </div>
    </details>
  );
}