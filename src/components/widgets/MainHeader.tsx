import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from '../interface/Box';

interface MainHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

/* MainHeaderClasses: contenedor (Box). shrink-0: nunca se comprime, sin importar
   qué otro hermano (como un FilterPanel abierto) necesite espacio. */
const MainHeaderClasses = {
  required: 'flex shrink-0 items-center gap-(--size-m)',
  style: '',
};

/* MainHeaderTitleColumnClasses: columna de título */
const MainHeaderTitleColumnClasses = {
  required: 'flex flex-1 items-center',
  style: '',
};

/* MainHeaderTitleClasses */
const MainHeaderTitleClasses = {
  required: '',
  style: 'text-4xl font-semibold tracking-tight text-gray-900',
};

/* MainHeaderActionClasses: contenedor de la acción */
const MainHeaderActionClasses = {
  required: 'flex shrink-0 items-center',
  style: '',
};

export default function MainHeader({ title, action, className }: MainHeaderProps) {
  return (
    <Box className={twMerge(MainHeaderClasses.required, MainHeaderClasses.style, className)}>
      {action && (
        <div className={twMerge(MainHeaderActionClasses.required, MainHeaderActionClasses.style)}>
          {action}
        </div>
      )}
      <div className={twMerge(MainHeaderTitleColumnClasses.required, MainHeaderTitleColumnClasses.style)}>
        <h1 className={twMerge(MainHeaderTitleClasses.required, MainHeaderTitleClasses.style)}>{title}</h1>
      </div>
    </Box>
  );
}
