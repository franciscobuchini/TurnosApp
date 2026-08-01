import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from '../interface/Box';

interface MainHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

/* MainHeaderClasses: contenedor (Box) */
const MainHeaderClasses = {
  required: 'flex items-center justify-between py-(--size-m) px-(--size-xl)',
  style: '',
};

/* MainHeaderTitleColumnClasses: columna de título y subtítulo */
const MainHeaderTitleColumnClasses = {
  required: 'flex flex-1 flex-col gap-(--size-2xs)',
  style: '',
};

/* MainHeaderTitleClasses */
const MainHeaderTitleClasses = {
  required: '',
  style: 'text-3xl text-white font-semibold tracking-tight',
};

/* MainHeaderSubtitleClasses */
const MainHeaderSubtitleClasses = {
  required: 'line-clamp-2 text-sm',
  style: 'text-neutral-500',
};

/* MainHeaderActionClasses: contenedor de la acción */
const MainHeaderActionClasses = {
  required: 'flex shrink-0 items-center',
  style: '',
};

export default function MainHeader({ title, subtitle, action, className }: MainHeaderProps) {
  return (
    <Box className={twMerge(MainHeaderClasses.required, MainHeaderClasses.style, className)}>
      <div className={twMerge(MainHeaderTitleColumnClasses.required, MainHeaderTitleColumnClasses.style)}>
        <h1 className={twMerge(MainHeaderTitleClasses.required, MainHeaderTitleClasses.style)}>{title}</h1>
        {subtitle && (
          <span className={twMerge(MainHeaderSubtitleClasses.required, MainHeaderSubtitleClasses.style)}>
            {subtitle}
          </span>
        )}
      </div>
      {action && (
        <div className={twMerge(MainHeaderActionClasses.required, MainHeaderActionClasses.style)}>
          {action}
        </div>
      )}
    </Box>
  );
}
