import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from './Box';

interface MainHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

const MAIN_HEADER_CLASS = 'flex shrink-0 items-center gap-(--size-xl) h-(--size-6xl)';

const MAIN_HEADER_TITLE_COLUMN_CLASS = 'flex flex-1 items-center';

const MAIN_HEADER_TITLE_CLASS = 'text-4xl font-semibold tracking-tight text-neutral-900 leading-none';

const MAIN_HEADER_ACTION_CLASS = 'flex shrink-0 items-center self-center';

export default function MainHeader({ title, action, className }: MainHeaderProps) {
  return (
    <Box className={twMerge(MAIN_HEADER_CLASS, className)}>
      {action && (
        <div className={MAIN_HEADER_ACTION_CLASS}>
          {action}
        </div>
      )}
      <div className={MAIN_HEADER_TITLE_COLUMN_CLASS}>
        <h1 className={MAIN_HEADER_TITLE_CLASS}>{title}</h1>
      </div>
    </Box>
  );
}
