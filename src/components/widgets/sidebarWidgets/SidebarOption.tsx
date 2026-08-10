/*
  src/components/widgets/sidebarWidgets/SidebarOption.tsx
  Contenedor simple de una sidebar: panel con un ContentHeader adentro.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import ContentHeader from '@/components/ui/content-header';

interface SidebarOptionProps {
  id?: string;
  title: ReactNode;
  icon?: ReactNode;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}

const PANEL_CLASS =
  'h-16 flex w-full shrink-0 items-center rounded-3xl bg-transparent text-white p-2 ';

const PANEL_SELECTED_CLASS = 'bg-neutral-900';

export default function SidebarOption({
  id,
  title,
  icon,
  selectedId,
  onSelect,
  className,
}: SidebarOptionProps) {
  const isSelected = id != null && id === selectedId;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(id as string)}
      className={twMerge(
        PANEL_CLASS,
        isSelected ? PANEL_SELECTED_CLASS : '',
        className,
      )}
    >
      {icon && <span className="pl-3">{icon}</span>}
      <ContentHeader title={title} className="w-full text-left" />
    </button>
  );
}