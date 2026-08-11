import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface MainHeaderProps {
  title: string;
  action?: ReactNode;
  leading?: ReactNode;
  actionsRight?: ReactNode;
  className?: string;
  titleClassName?: string;
  gradient?: boolean;
}

const MAIN_HEADER_CLASS = 'flex h-18 w-full items-center';
const MAIN_HEADER_BLEED_CLASS = '';
const MAIN_HEADER_TITLE_COLUMN_CLASS = 'flex min-w-0 flex-1 items-center justify-center';
const MAIN_HEADER_TITLE_CLASS = 'text-3xl font-semibold tracking-tight leading-none text-foreground text-center';
const MAIN_HEADER_ACTION_CLASS = 'self-center shrink-0 bg-muted rounded-full';
const MAIN_HEADER_LEADING_CLASS = 'flex shrink-0 items-center self-center';
const MAIN_HEADER_ACTIONS_RIGHT_CLASS = 'gap-3 self-center shrink-0';

export default function MainHeader({ title, action, leading, actionsRight, className, titleClassName, gradient = true }: MainHeaderProps) {
  return (
    <div className={twMerge(gradient ? '' : '', MAIN_HEADER_BLEED_CLASS, MAIN_HEADER_CLASS, className)}>
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
    </div>
  );
}