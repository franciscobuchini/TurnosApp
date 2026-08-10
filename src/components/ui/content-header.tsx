import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from './box';

interface ContentHeaderProps {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

const CONTENT_HEADER_CLASS = 'flex items-center justify-between px-6';

const CONTENT_HEADER_TITLE_COLUMN_CLASS = 'flex flex-1 flex-col gap-1';

const CONTENT_HEADER_TITLE_CLASS = 'text-xl text-white tracking-tight';

const CONTENT_HEADER_SUBTITLE_CLASS = 'line-clamp-2 text-sm text-neutral-500';

const CONTENT_HEADER_ACTION_CLASS = 'flex shrink-0 items-center';

export default function ContentHeader({ title, subtitle, action, className }: ContentHeaderProps) {
  return (
    <Box className={twMerge(CONTENT_HEADER_CLASS, className)}>
      <div className={CONTENT_HEADER_TITLE_COLUMN_CLASS}>
        <h1 className={CONTENT_HEADER_TITLE_CLASS}>{title}</h1>
        {subtitle && (
          <span className={CONTENT_HEADER_SUBTITLE_CLASS}>
            {subtitle}
          </span>
        )}
      </div>
      {action && (
        <div className={CONTENT_HEADER_ACTION_CLASS}>
          {action}
        </div>
      )}
    </Box>
  );
}