import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import MainHeader from './MainHeader';
import Logo from './Logo';

interface SidebarHeaderProps {
  title?: string;
  className?: string;
  leading?: ReactNode;
}

const SIDEBAR_HEADER_CLASS = 'flex h-32 w-full shrink-0 bg-transparent';

export default function SidebarHeader({
  title = 'minube.site',
  className,
  leading = <Logo className="h-(--size-4xl) w-auto" />,
}: SidebarHeaderProps) {
  return (
    <MainHeader
      title={title}
      leading={leading}
      titleClassName="text-neutral-50"
      gradient={false}
      fullBleed={false}
      className={twMerge(SIDEBAR_HEADER_CLASS, className)}
    />
  );
}