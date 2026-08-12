/*
  src/components/widgets/DetailsPanel.tsx
  Panel colapsable reutilizable con details/summary.
*/

import type { DetailsHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Dropdown } from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';
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
  /** Id de la opción seleccionada (se resalta) y callback al hacer click en la fila. */
  selectedId?: string;
  onOptionClick?: (option: DetailsPanelOption) => void;
}

const FILTER_PANEL_CLASS = 'group w-full cursor-pointer overflow-hidden shrink-0 rounded-4xl text-foreground p-2 bg-card border border-border';

const FILTER_PANEL_BODY_CLASS = 'flex flex-col flex-1 min-h-0 overflow-y-auto pt-1 ';

const DETAILS_PANEL_CONTENT_CLASS = 'flex items-center align-center gap-3 h-12 w-full text-left';

const DETAILS_PANEL_AVATAR_CLASS = 'h-8 w-8 shrink-0';
const DETAILS_PANEL_IMAGE_CLASS = 'h-full w-full';

const DETAILS_PANEL_LABEL_CLASS = '';

const DETAILS_PANEL_TRIGGER_CLASS = 'w-full h-12 gap-4 shrink-0 justify-center text-muted-foreground hover:text-foreground rounded-3xl';
const DETAILS_PANEL_TRIGGER_OPEN_CLASS = 'bg-background';

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
  selectedId,
  onOptionClick,
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
        {options.map((option) => {
          const content = (
            <div
              data-details-panel-content
              className={twMerge(
                DETAILS_PANEL_CONTENT_CLASS,
                option.checked === false && 'opacity-40',
              )}
            >
              <span className={DETAILS_PANEL_AVATAR_CLASS}>
                <Image
                  name={option.label}
                  className={twMerge(DETAILS_PANEL_IMAGE_CLASS, option.colorClassName)}
                />
              </span>
              <span className={DETAILS_PANEL_LABEL_CLASS}>{option.label}</span>
            </div>
          );

          /* Sin ítems de dropdown, la fila es un botón simple (selección):
             el mismo Button ghost que usa el Dropdown para idéntico estilo. */
          return renderDropdownItems ? (
            <Dropdown
              key={option.id}
              items={renderDropdownItems(option)}
              onClick={() => onOptionClick?.(option)}
              content={content}
              className={DETAILS_PANEL_TRIGGER_CLASS}
              openClassName={DETAILS_PANEL_TRIGGER_OPEN_CLASS}
            />
          ) : (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              className={twMerge(
                DETAILS_PANEL_TRIGGER_CLASS,
                'text-left',
                option.id === selectedId && DETAILS_PANEL_TRIGGER_OPEN_CLASS,
              )}
              onClick={() => onOptionClick?.(option)}
            >
              {content}
            </Button>
          );
        })}

        {action ?? (actionLabel ? <AddButton text={actionLabel} onClick={onActionClick} /> : null)}
      </div>
    </details>
  );
}