import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Logo from '@/components/ui/logo';

interface SidebarHeaderProps {
  title?: string;
  className?: string;
  leading?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
}

const SIDEBAR_HEADER_CLASS = 'flex h-24 w-full shrink-0 bg-transparent items-center gap-2 px-3';

export default function SidebarHeader({
  title = 'minube.site',
  className,
  leading = <Logo className="h-12 w-auto" />,
  action,
  onClick,
}: SidebarHeaderProps) {
  const header = (
    <div className={twMerge(SIDEBAR_HEADER_CLASS, className)}>
      {leading && (
        <div className="flex shrink-0 items-center self-center">
          {leading}
        </div>
      )}

      <div className="flex min-w-0 flex-1 items-center">
        <h1 className="text-3xl font-semibold tracking-tight leading-none text-neutral-50 truncate">
          {title}
        </h1>
      </div>

      {action && (
        <div className="gap-3 self-center shrink-0 flex">
          {action}
        </div>
      )}
    </div>
  );

  if (!onClick) {
    return header;
  }

  return (
    <button type="button" onClick={onClick}>
      {header}
    </button>
  );
}