import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from './Box';

interface ContentHeaderProps {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

/* ContentHeaderClasses: contenedor (Box)*/
const ContentHeaderClasses = {
  required: 'flex items-center justify-between px-(--size-l)',
  style: '',
};

/* ContentHeaderTitleColumnClasses: columna de título y subtítulo*/
const ContentHeaderTitleColumnClasses = {
  required: 'flex flex-1 flex-col gap-(--size-2xs)',
  style: '',
};

/* ContentHeaderTitleClasses*/
const ContentHeaderTitleClasses = {
  required: '',
  style: 'text-xl font-semibold text-white tracking-tight',
};

/* ContentHeaderSubtitleClasses*/
const ContentHeaderSubtitleClasses = {
  required: 'line-clamp-2 text-sm',
  style: 'text-neutral-500',
};

/* ContentHeaderActionClasses: contenedor de la acción*/
const ContentHeaderActionClasses = {
  required: 'flex shrink-0 items-center',
  style: '',
};

export default function ContentHeader({ title, subtitle, action, className }: ContentHeaderProps) {
  return (
    <Box className={twMerge(ContentHeaderClasses.required, ContentHeaderClasses.style, className)}>
      <div className={twMerge(ContentHeaderTitleColumnClasses.required, ContentHeaderTitleColumnClasses.style)}>
        <h1 className={twMerge(ContentHeaderTitleClasses.required, ContentHeaderTitleClasses.style)}>{title}</h1>
        {subtitle && (
          <span className={twMerge(ContentHeaderSubtitleClasses.required, ContentHeaderSubtitleClasses.style)}>
            {subtitle}
          </span>
        )}
      </div>
      {action && (
        <div className={twMerge(ContentHeaderActionClasses.required, ContentHeaderActionClasses.style)}>
          {action}
        </div>
      )}
    </Box>
  );
}