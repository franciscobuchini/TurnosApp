import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from './Box';

interface MainHeaderProps {
  title: string;
  action?: ReactNode;
  leading?: ReactNode;
  actionsRight?: ReactNode;
  className?: string;
  titleClassName?: string;
}

const MAIN_HEADER_CLASS = 'flex shrink-0 items-center gap-(--size-xl) h-(--size-6xl)';

const MAIN_HEADER_LEADING_CLASS = 'flex shrink-0 items-center self-center';

const MAIN_HEADER_TITLE_COLUMN_CLASS = 'flex flex-1 items-center';

const MAIN_HEADER_TITLE_CLASS = 'text-4xl font-semibold tracking-tight leading-none';

const MAIN_HEADER_ACTION_CLASS = 'flex shrink-0 items-center self-center';

const MAIN_HEADER_ACTIONS_RIGHT_CLASS = 'flex shrink-0 items-center gap-(--size-s) self-center';

export default function MainHeader({ title, action, leading, actionsRight, className, titleClassName }: MainHeaderProps) {
  return (
    <Box className={twMerge(MAIN_HEADER_CLASS, className)}>
      {action && (
        <div className={MAIN_HEADER_ACTION_CLASS}>
          {action}
        </div>
      )}
      {leading && (
        <div className={MAIN_HEADER_LEADING_CLASS}>
          {leading}
        </div>
      )}
      <div className={MAIN_HEADER_TITLE_COLUMN_CLASS}>
        <h1 className={twMerge(MAIN_HEADER_TITLE_CLASS, titleClassName)}>{title}</h1>
      </div>
      {actionsRight && (
        <div className={MAIN_HEADER_ACTIONS_RIGHT_CLASS}>
          {actionsRight}
        </div>
      )}
    </Box>
  );
}
