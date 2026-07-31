import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from '../interface/Box';

interface SidebarHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

/* SidebarHeaderClasses: contenedor (Box) */
const SidebarHeaderClasses = {
  required: 'flex items-center justify-between py-(--size-m) px-(--size-xl)',
  style: '',
};

/* SidebarHeaderTitleColumnClasses: columna de título y subtítulo */
const SidebarHeaderTitleColumnClasses = {
  required: 'flex flex-1 flex-col gap-(--size-2xs)',
  style: '',
};

/* SidebarHeaderTitleClasses */
const SidebarHeaderTitleClasses = {
  required: '',
  style: 'text-3xl text-white font-semibold tracking-tight',
};

/* SidebarHeaderSubtitleClasses */
const SidebarHeaderSubtitleClasses = {
  required: 'line-clamp-2 text-sm',
  style: 'text-neutral-500',
};

/* SidebarHeaderActionClasses: contenedor de la acción */
const SidebarHeaderActionClasses = {
  required: 'flex shrink-0 items-center',
  style: '',
};

export default function SidebarHeader({ title, subtitle, action, className }: SidebarHeaderProps) {
  return (
    <Box className={twMerge(SidebarHeaderClasses.required, SidebarHeaderClasses.style, className)}>
      <div className={twMerge(SidebarHeaderTitleColumnClasses.required, SidebarHeaderTitleColumnClasses.style)}>
        <h1 className={twMerge(SidebarHeaderTitleClasses.required, SidebarHeaderTitleClasses.style)}>{title}</h1>
        {subtitle && (
          <span className={twMerge(SidebarHeaderSubtitleClasses.required, SidebarHeaderSubtitleClasses.style)}>
            {subtitle}
          </span>
        )}
      </div>
      {action && (
        <div className={twMerge(SidebarHeaderActionClasses.required, SidebarHeaderActionClasses.style)}>
          {action}
        </div>
      )}
    </Box>
  );
}
